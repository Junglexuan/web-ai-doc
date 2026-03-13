/* eslint-env browser */
// @ts-nocheck
window.ApiBaseUrl = '';
window.ApiPrefix = {
  '/auth/': 'http://user.binarysee.com/auth/',
  '/dream/': '/dream/',
  '/api/': '/report/', //http://106gx1895yn84.vicp.fun/
  '/ws/': 'ws://xiaoli.binarysee.com/report/ws/', //ws://113.44.121.105/report/ws/
};
window.SitesUrl = {
  user: '//user.binarysee.com',
  nexus: '//nexus.binarysee.com',
  helix: '//helix.binarysee.com',
  verse: '//verse.binarysee.com',
  pulse: '//pulse.binarysee.com',
  preview: 'http://113.44.121.105:8012/onlinePreview',
};
window.PathPrefix = '/xiaoli-desktop';
window.SiteInfo = {
  logo: '/xiaoli-desktop/client/logo.svg',
  name: '星启·文枢',
  sites: {pulse: '星启·脉擎', helix: '星启·数璇'},
  /** 溯源页顶部右侧「返回」外链地址，不配置则不显示 */
  traceBackUrl: '',
};
