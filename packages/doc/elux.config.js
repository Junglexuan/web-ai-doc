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
        '/user/': 'http://172.16.8.151/user/',
        '/upload/': 'http://172.16.8.151/app/',
        '/app/': 'http://172.16.8.151/brain/',
        '/meta/': 'http://172.16.8.151/brain/',
        '/dream/': 'http://172.16.18.14:8081/',
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
