export default {
  expo: {
    name: 'WordPang',
    slug: 'wordpang',
    version: '3.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'wordpang',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFF0F5',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.philokalos.wordpang',
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
    owner: 'philokalos',
    extra: {
      eas: {
        projectId: '9bee029b-63b4-4a2e-aa93-5b6dd688205c',
      },
    },
    experiments: {
      typedRoutes: true,
    },
  },
};
