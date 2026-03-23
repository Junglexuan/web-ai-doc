/* eslint-env browser */
// @ts-nocheck
window.ApiBaseUrl = '';
window.ApiPrefix = {
  '/auth/': 'http://user.binarysee.com.cn/auth/', //http://user.binarysee.com.cn/auth/ http://192.168.8.201:21000/
  '/dream/': '/dream/',
  '/api/': '/report/', //http://106gx1895yn84.vicp.fun/
  '/ws/': 'ws://68.79.42.215/report/ws/', //ws://113.44.121.105/report/ws/   192.168.8.201:20101
};
window.SitesUrl = {
  user: '//user.binarysee.com.cn',
  nexus: '//nexus.binarysee.com.cn',
  helix: '//helix.binarysee.com.cn',
  verse: '//verse.binarysee.com.cn',
  pulse: 'http://113.44.121.105:8066', //pulse.binarysee.com.cn
  preview: 'http://68.79.42.215/report/onlinePreview', //http://68.79.42.215
};
window.PathPrefix = '/xiaoli-desktop';
window.SiteInfo = {
  logo: '/xiaoli-desktop/client/logo.svg',
  name: '星启·文枢',
  sites: {pulse: '星启·脉擎', helix: '星启·数璇'},
  /** 溯源页顶部右侧「返回」外链地址，不配置则不显示 */
  traceBackUrl: 'http://192.168.8.201:21003/zov-portal-web/app/xl-dueDiligence', //http://192.168.8.201:21003/zov-portal-web/app/xl-dueDiligence
};
