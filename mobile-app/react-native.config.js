module.exports = {
  dependencies: {
    'react-native-sqlite-storage': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-sqlite-storage/platforms/android',
          packageImportPath: 'io.liteglue.SQLitePluginPackage',
        },
      },
    },
    'react-native-vector-icons': {
      platforms: {
        ios: null, // disable iOS platform, other platforms will still autolink if provided
      },
    },
  },
  assets: ['./src/assets/fonts/'], // stays the same
};
