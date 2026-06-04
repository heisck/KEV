// Babel config used by jest-expo (and as a fallback for Metro). The Expo preset
// handles TypeScript/JSX, the React Compiler, and react-native-worklets.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
