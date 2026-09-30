const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Permite la carga de modelos de Machine Learning (.bin y .json)
config.resolver.assetExts.push('bin', 'json');

module.exports = config;