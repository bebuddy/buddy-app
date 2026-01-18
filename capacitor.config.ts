import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kkanbu.buddyapp',
  appName: 'BuddyApp',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;