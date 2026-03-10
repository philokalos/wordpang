export default {
  expo: {
    name: 'Wordle',
    slug: 'wordle',
    version: '2.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'wordle',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFF0F5',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.philokalos.wordle',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
  },
};
