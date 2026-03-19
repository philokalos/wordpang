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
      supportsTablet: true,
      bundleIdentifier: 'com.philokalos.wordpop',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    plugins: [
      'expo-router',
      [
        'expo-build-properties',
        {
          ios: {
            privacyManifests: {
              NSPrivacyAccessedAPITypes: [
                {
                  NSPrivacyAccessedAPIType:
                    'NSPrivacyAccessedAPICategoryUserDefaults',
                  NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
                },
              ],
            },
          },
        },
      ],
    ],
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
