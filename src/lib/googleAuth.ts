import { Capacitor, registerPlugin } from '@capacitor/core';
import { supabase } from '@/lib/supabase';

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

    console.log('[GoogleAuth] Setting session on client...');

    // 클라이언트에서 직접 세션 설정
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error('[GoogleAuth] setSession error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[GoogleAuth] Session set successfully');
    return { success: true };
  } catch (error) {
    console.error('Native Google Sign-In error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
