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
    CapacitorHttp: {
      enabled: false,
    },
    CapacitorCookies: {
      enabled: false,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      androidClientId: '81299150317-m8r55d5v034qrpdgshqf287ouq2ml5om.apps.googleusercontent.com',
      serverClientId: '81299150317-m8r55d5v034qrpdgshqf287ouq2ml5om.apps.googleusercontent.com',
      iosClientId: '81299150317-68dvc0kap84cuas3k3iefrglcb1l5anh.apps.googleusercontent.com',
      forceCodeForRefreshToken: false,
    },
  },
};

export default config;
