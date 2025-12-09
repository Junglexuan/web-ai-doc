/**
 * 该文件是应用的入口文件
 */
//import './default-passive-events.js';
import {createApp} from '@elux/react-web';
import {appConfig} from './Project';
import {isIframe} from './utils/tools';

(window as any)['ZovCloudUI'] && (window as any)['ZovCloudUI'].register();

// loading状态管理
let isLoading = isIframe();
console.log('isInIframe: 当前是否iframe嵌套', isLoading);
// let appStarted = false; //避免重复渲染

const originWhiteList = ['http://113.44.121.105', 'http://192.168.1.126:5173']; //定义一套自定义消息共享源链白名单
const handleMessage = (event: MessageEvent) => {
  console.log('event信息监听: ', event);
  //验证消息来源
  if (!originWhiteList.includes(event.origin)) {
    return;
  }
  const {method, data} = event.data;
  //验证消息格式
  if (!method?.startsWith('zov:')) {
    console.warn('收到非法的跨域消息源:', event.origin);
    return;
  }
  if (method === 'zov:USER_INFO_DELIVERY') {
    console.info('收到用户信息:', data);
    const {token, userInfo, portalUrl} = data;
    if (token && userInfo) {
      try {
        console.log('token: ', token);
        localStorage.setItem('zov-user-token', token);
        localStorage.setItem('zov-user-info', JSON.stringify(userInfo));
        localStorage.setItem('zov-user-tenant', userInfo.tenantId);
        localStorage.setItem('zov-msg-origin', portalUrl);
        isLoading = false;
        //移除loading并渲染应用
        //在开始渲染后，更新本地存储并触发渲染
        renderApp();

        console.log('用户信息设置完成，开始渲染应用');
      } catch (error) {
        console.error('设置用户信息失败:', error);
        isLoading = false;
        renderApp();
      }
    }
  }
};

//渲染应用的函数
const renderApp = () => {
  // if (appStarted) return; //<-- 防止重复初始化
  if (!isLoading) {
    // appStarted = true; //监听工作台token及用户信息设置本地后标记已启动，避免重复
    createApp(appConfig)
      .render()
      .then(() => {
        const initLoading = document.getElementById('root-loading');
        if (initLoading) {
          initLoading.parentNode!.removeChild(initLoading);
        }
      });
  }
};

if (isLoading) {
  console.info('子应用发送READY消息触发父窗口通知下发!!!');
  window.parent.postMessage({method: 'zov:PRODUCT_READY'}, '*');
} else {
  renderApp();
}
//无论是否已有本地用户信息，都监听跨域消息以便在父窗口推送新用户信息时更新本地存储
console.log('监听跨域消息...');
window.addEventListener('message', handleMessage);
