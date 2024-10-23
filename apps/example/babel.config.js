const path = require('path');
const pkg = require('../../packages/react-native-wasm/package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
        alias: {
          'react-native-wasm': path.join(
            __dirname,
            '..',
            '..',
            'packages',
            'react-native-wasm',
            pkg.source
          ),
        },
      },
    ],
  ],
};
