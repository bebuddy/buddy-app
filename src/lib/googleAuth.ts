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

    // callback URL에서 토큰 파싱
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

    console.log('[GoogleAuth] Submitting tokens to server for session setup...');

    // Form POST로 서버에 토큰 전달 (CORS 이슈 없음)
    // 서버가 setSession 처리 후 /verify로 redirect
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/auth/set-session';
    form.style.display = 'none';

    const input1 = document.createElement('input');
    input1.type = 'hidden';
    input1.name = 'access_token';
    input1.value = accessToken;
    form.appendChild(input1);

    const input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'refresh_token';
    input2.value = refreshToken;
    form.appendChild(input2);

    document.body.appendChild(form);
    form.submit();

    // form.submit()이 페이지를 이동시키므로 여기에 도달하지 않음
    return { success: true };
  } catch (error) {
    console.error('Native Google Sign-In error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
