import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schoolerp.app',
  appName: 'School ERP',
  server: {
    url: 'https://schoolerp.nh360fastag.com',
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
