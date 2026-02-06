import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kkanbu.buddyapp',
  appName: '벗',
  webDir: 'out',
  server: {
    url: 'https://seniorbuddy.vercel.app',
    cleartext: false
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
      iosClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
      forceCodeForRefreshToken: false,
    },
  },
};

export default config;
