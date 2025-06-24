import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schoolerp.app',
  appName: 'School ERP',
  webDir: 'out',
  server: {
    androidScheme: 'http',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
