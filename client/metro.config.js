const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Windows: disable package exports resolution which can cause issues
// with newly created directories not being picked up by Metro
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
