// eslint-disable-next-line import/no-extraneous-dependencies
//const {getLocalIP} = require('@elux/cli-utils');
//const APP_ENV = process.env.APP_ENV || 'local';
//const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
  type: 'react',
  mockServer: {port: 3003},
  cssProcessors: {less: true},
  all: {
    serverPort: 4003,
    clientGlobalVar: {
      ApiPrefix: {
        '/dream/': 'http://331qy963dj35.vicp.fun:15537/dream/',
      },
      StaticPrefix: {
        '/imgs/': '/imgs/',
      },
    },
    urlLoaderLimitSize: 100,
    webpackConfigTransform: (config) => {
      // config.plugins.push(
      //   new MonacoWebpackPlugin({
      //     // available options are documented at https://github.com/microsoft/monaco-editor/blob/main/webpack-plugin/README.md#options
      //     //languages: ['java', 'json'],
      //   })
      // );
      config.resolve.fallback = {path: false, stream: false};
      //config.resolve.fallback = {path: require.resolve('path-browserify'), stream: require.resolve('stream-browserify')};
      return config;
    },
  },
  dev: {
    eslint: false,
    stylelint: false,
  },
};
