//该配置文件可以覆盖项目根目录下的elux.config.js
module.exports = {
  prod: {
    clientGlobalVar: {
      PathPrefix: '/logic-composer',
      ApiPrefix: {
        '/meta/': 'http://meta.uat.zov.com/',
        '/user/': 'http://user.uat.zov.com/',
        '/upload/': 'http://app.uat.zov.com/',
        '/app/': 'http://app.uat.zov.com/',
      },
      StaticPrefix: {
        '/imgs/': '/imgs/',
      },
    },
    clientPublicPath: '/logic-composer/client/',
    clientMinimize: false,
    eslint: false,
    stylelint: false,
    sourceMap: 'cheap-module-source-map',
  },
};
