import { Capacitor, registerPlugin } from '@capacitor/core';
import { GoogleAuth as GoogleAuthStd } from '@codetrix-studio/capacitor-google-auth';
import { supabase } from '@/lib/supabase';

export type OAuthProvider = 'google' | 'apple';

export interface NativeAuthResult {
  success: boolean;
  error?: string;
}

interface GoogleAuthPlugin {
  initialize(): Promise<void>;
  signInWithOAuth(options: { url: string; callbackScheme: string }): Promise<{ url: string }>;
  signInWithApple(): Promise<{ identityToken: string }>;
  signOut(): Promise<void>;
}

const GoogleAuth = registerPlugin<GoogleAuthPlugin>('GoogleAuth');

export const isNativeIOS = (): boolean => {
  try {
    return Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
};

export const isNativeAndroid = (): boolean => {
  try {
    return Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
};

export const isNativePlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

const PENDING_TOKENS_KEY = '__native_pending_tokens';
const APPLE_ID_TOKEN_KEY = '__native_apple_id_token';

function formatNativeAuthError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const maybeError = error as Record<string, unknown>;
    const code = typeof maybeError.code === 'string' || typeof maybeError.code === 'number'
      ? String(maybeError.code)
      : null;
    const message = typeof maybeError.message === 'string'
      ? maybeError.message
      : null;

    if (code && message) {
      return `${message} (code: ${code})`;
    }

    if (message) {
      return message;
    }

    if (code) {
      return `Google Sign-In failed (code: ${code})`;
    }

    try {
      return JSON.stringify(maybeError);
    } catch {
      return 'Unknown error occurred';
    }
  }

  return 'Unknown error occurred';
}

/**
 * OAuth 인앱 브라우저 복귀 직후에는 네트워크 "load failed"가 발생하므로
 * setSession()을 바로 호출할 수 없음. 대신 임시 키에 토큰을 저장하고
 * /verify 페이지에서 네트워크가 안정된 후 setSession()을 호출.
 */
export function storePendingNativeTokens(accessToken: string, refreshToken: string, provider: OAuthProvider): void {
  localStorage.setItem(PENDING_TOKENS_KEY, JSON.stringify({ accessToken, refreshToken, provider }));
}

export function getPendingNativeTokens(): { accessToken: string; refreshToken: string; provider: OAuthProvider } | null {
  const raw = localStorage.getItem(PENDING_TOKENS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingNativeTokens(): void {
  localStorage.removeItem(PENDING_TOKENS_KEY);
}

export function storeNativeAppleIdToken(identityToken: string): void {
  localStorage.setItem(APPLE_ID_TOKEN_KEY, identityToken);
}

export function getNativeAppleIdToken(): string | null {
  return localStorage.getItem(APPLE_ID_TOKEN_KEY);
}

export function clearNativeAppleIdToken(): void {
  localStorage.removeItem(APPLE_ID_TOKEN_KEY);
}

export const signInWithAppleNative = async (): Promise<NativeAuthResult> => {
  try {
    const result = await GoogleAuth.signInWithApple();

    storeNativeAppleIdToken(result.identityToken);

    return { success: true };
  } catch (error) {
    console.error('Native Apple Sign-In error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const signInWithGoogleNativeAndroid = async (): Promise<NativeAuthResult> => {
  try {
    await GoogleAuthStd.initialize({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
    });
    const result = await GoogleAuthStd.signIn();

    const idToken = result.authentication?.idToken;
    if (!idToken) {
      return { success: false, error: 'No ID token from Google Sign-In' };
    }

    // Android WebView의 네트워크가 Google Sign-In 액티비티 복귀 후 안정화될 때까지 재시도
    let lastError: string | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
      try {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (error) {
          lastError = error.message;
          continue;
        }
        return { success: true };
      } catch (fetchErr) {
        lastError = fetchErr instanceof Error ? fetchErr.message : 'Fetch failed';
      }
    }

    return { success: false, error: lastError };
  } catch (error) {
    console.error('Android native Google Sign-In error:', error);
    return {
      success: false,
      error: formatNativeAuthError(error),
    };
  }
};

export const signInWithOAuthNative = async (provider: OAuthProvider): Promise<NativeAuthResult> => {
  try {
    await GoogleAuth.initialize();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const redirectTo = 'buddyapp://auth/callback';
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;

    const result = await GoogleAuth.signInWithOAuth({
      url: authUrl,
      callbackScheme: 'buddyapp',
    });

    const callbackUrl = result.url;
    const hashPart = callbackUrl.split('#')[1];

    if (!hashPart) {
      return { success: false, error: 'No tokens in callback URL' };
    }

    const params = new URLSearchParams(hashPart);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      return { success: false, error: 'Missing tokens in callback' };
    }

    storePendingNativeTokens(accessToken, refreshToken, provider);

    return { success: true };
  } catch (error) {
    console.error(`Native ${provider} Sign-In error:`, error);
    return {
      success: false,
      error: formatNativeAuthError(error)
    };
  }
};
