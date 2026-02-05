import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kkanbu.buddyapp',
  appName: '벗',
  webDir: 'out',
  server: {
    url: 'https://seniorbuddy.vercel.app',
    cleartext: false
  }
};

export default config;
