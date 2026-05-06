// filepath: metro.config.js
// NativeWind v4 REQUIRES this file to process className props.
// Without it, all Tailwind styles are silently ignored at runtime.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
