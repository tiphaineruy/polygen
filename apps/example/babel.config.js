const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../../packages/react-native-wasm/package.json');

const root = path.resolve(__dirname, '..');

module.exports = getConfig(
  {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      ['module-resolver', {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
        alias: {
          'react-native-wasm': path.join(__dirname, '..', '..', 'packages', 'react-native-wasm', pkg.source),
        }
      }]
    ]
  },
  { root, pkg }
);
