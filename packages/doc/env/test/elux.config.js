//该配置文件可以覆盖项目根目录下的elux.config.js
module.exports = {
  prod: {
    clientGlobalVar: {},
    clientPublicPath: '/client/',
    clientMinimize: false,
    eslint: false,
    stylelint: false,
    //sourceMap: 'cheap-module-source-map',
  },
};
