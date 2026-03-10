export default {
  expo: {
    name: 'WordPop',
    slug: 'wordpop',
    version: '3.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'wordpop',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFF0F5',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.philokalos.wordpop',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
  },
};
