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
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    plugins: ['expo-router'],
    extra: {
      eas: {
        projectId: 'deb53a91-bcbb-4cb4-a020-7aeae4085b81',
      },
    },
    experiments: {
      typedRoutes: true,
    },
  },
};
