import { Capacitor, registerPlugin } from '@capacitor/core';

export type OAuthProvider = 'google' | 'apple';

export interface NativeAuthResult {
  success: boolean;
  error?: string;
}

interface GoogleAuthPlugin {
  initialize(): Promise<void>;
  signInWithOAuth(options: { url: string; callbackScheme: string }): Promise<{ url: string }>;
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

const PENDING_TOKENS_KEY = '__native_pending_tokens';

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
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
