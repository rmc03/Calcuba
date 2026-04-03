const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidABI(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      // Inyectar el filtro de arquitecturas solo a 64 bits para aligerar la APK en 70%
      if (!config.modResults.contents.includes('abiFilters "arm64-v8a"')) {
        config.modResults.contents = config.modResults.contents.replace(
          /defaultConfig\s*\{/,
          `defaultConfig {\n        ndk {\n            abiFilters "arm64-v8a"\n        }`
        );
      }
    }
    return config;
  });
};
