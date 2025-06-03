//该配置文件可以覆盖项目根目录下的elux.config.js
module.exports = {
  prod: {
    clientGlobalVar: {
      PathPrefix: '/ai-doc',
      ApiPrefix: {
        '/auth/': 'http://8.130.27.129/auth/',
        '/dream/': '/dream/',
      },
      StaticPrefix: {
        '/imgs/': '/imgs/',
      },
    },
    clientPublicPath: '/ai-doc/client/',
    clientMinimize: false,
    eslint: false,
    stylelint: false,
    //sourceMap: 'cheap-module-source-map',
  },
};
