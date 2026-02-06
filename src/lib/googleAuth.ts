import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';

export interface GoogleAuthResult {
  success: boolean;
  error?: string;
}

export const isNativeIOS = (): boolean => {
  try {
    return Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
};

export const signInWithGoogleNative = async (): Promise<GoogleAuthResult> => {
  try {
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');

    await GoogleAuth.initialize({
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });

    const googleUser = await GoogleAuth.signIn();
    const { idToken, accessToken } = googleUser.authentication;

    if (!idToken) {
      return { success: false, error: 'No ID token received from Google' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      access_token: accessToken,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Native Google Sign-In error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
