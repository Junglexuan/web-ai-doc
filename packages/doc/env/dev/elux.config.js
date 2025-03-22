//该配置文件可以覆盖项目根目录下的elux.config.js
module.exports = {
  prod: {
    clientGlobalVar: {
      PathPrefix: '/logic-composer',
      ApiPrefix: {
        '/meta/': '/meta/',
        '/user/': '/user/',
        '/upload/': '/app/',
        '/app/': '/app/',
      },
      StaticPrefix: {
        '/imgs/': '/imgs/',
      },
    },
    clientPublicPath: '/logic-composer/client/',
    clientMinimize: false,
    sourceMap: 'cheap-module-source-map',
    eslint: false,
    stylelint: false,
  },
};
