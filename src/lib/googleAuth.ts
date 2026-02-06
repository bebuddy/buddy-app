import { Capacitor, registerPlugin } from '@capacitor/core';

export interface GoogleAuthResult {
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

/**
 * JWT에서 payload를 디코딩하여 세션 객체를 만들고 localStorage에 직접 저장.
 * supabase.auth.setSession()은 내부적으로 네트워크 요청을 하는데,
 * OAuth 인앱 브라우저에서 복귀 직후 "load failed"가 발생하므로 우회.
 */
function storeSessionManually(accessToken: string, refreshToken: string): void {
  const payloadBase64url = accessToken.split('.')[1];
  // base64url → standard base64 변환
  const payloadBase64 = payloadBase64url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(payloadBase64));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const storageKey = `sb-${projectRef}-auth-token`;

  const session = {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'bearer',
    expires_in: payload.exp - Math.floor(Date.now() / 1000),
    expires_at: payload.exp,
    user: {
      id: payload.sub,
      aud: payload.aud,
      role: payload.role,
      email: payload.email,
    },
  };

  localStorage.setItem(storageKey, JSON.stringify(session));
}

export const signInWithGoogleNative = async (): Promise<GoogleAuthResult> => {
  try {
    await GoogleAuth.initialize();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const redirectTo = 'buddyapp://auth/callback';
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;

    console.log('[GoogleAuth] Opening OAuth URL...');

    const result = await GoogleAuth.signInWithOAuth({
      url: authUrl,
      callbackScheme: 'buddyapp',
    });

    console.log('[GoogleAuth] Got callback URL');

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

    // 네트워크 요청 없이 localStorage에 직접 세션 저장
    storeSessionManually(accessToken, refreshToken);
    console.log('[GoogleAuth] Session stored in localStorage');

    return { success: true };
  } catch (error) {
    console.error('Native Google Sign-In error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
