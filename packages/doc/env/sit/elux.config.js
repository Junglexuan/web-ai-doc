//该配置文件可以覆盖项目根目录下的elux.config.js
module.exports = {
  prod: {
    clientGlobalVar: {
      PathPrefix: '/verse',
      ApiBaseUrl: '/verse',
      ApiPrefix: {
        '/auth/': '/auth/',
        '/dream/': '/dream/',
      },
      StaticPrefix: {
        '/imgs/': '/imgs/',
      },
    },
    clientPublicPath: '/verse/client/',
    clientMinimize: false,
    eslint: false,
    stylelint: false,
    //sourceMap: 'cheap-module-source-map',
  },
};
