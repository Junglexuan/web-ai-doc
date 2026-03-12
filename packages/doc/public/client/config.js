/* eslint-env browser */
// @ts-nocheck
window.ApiBaseUrl = '';
window.ApiPrefix = {
  '/auth/': 'http://user.binarysee.com/auth/', //http://user.binarysee.com.cn/auth/
  '/dream/': 'http://113.44.121.105/dream/', //http://verse.binarysee.com.cn/dream/ http://verse.binarysee.com/dream/
  '/api/': 'http://113.44.121.105/report/',
  '/ws/': 'ws://113.44.121.105/report/ws/', //ws://113.44.121.105/report/ws/
};
window.SitesUrl = {
  user: '//user.binarysee.com.cn',
  nexus: '//nexus.binarysee.com',
  helix: '//helix.binarysee.com',
  verse: '//localhost:4004',
  pulse: '//pulse.binarysee.com',
  preview: 'http://68.79.42.215:8012/onlinePreview', //预览
  editor: 'http://113.44.121.105:8901', //word编辑器
};
window.PathPrefix = '';
window.SiteInfo = {
  logo: '/xiaoli-report/client/logo.svg',
  name: '星启·文枢',
  sites: {pulse: '星启·脉擎', helix: '星启·数璇'},
};
