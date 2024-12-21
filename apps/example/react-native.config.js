const path = require('path');
const pkg = require('../../packages/polygen/package.json');
const { configureProjects } = require('react-native-test-app');

module.exports = {
  project: configureProjects({
    android: {
      sourceDir: 'android',
    },
    ios: {
      sourceDir: 'ios',
      automaticPodsInstallation: false,
    },
  }),
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..', '..', 'packages', 'polygen'),
    },
  },
};
