/**
 * 该文件是应用的入口文件
 */
//import './default-passive-events.js';
import {createApp} from '@elux/react-web';
import {register} from 'zov-cloud-ui';
import {appConfig} from './Project';

register();
createApp(appConfig)
  .render()
  .then(() => {
    const initLoading = document.getElementById('root-loading');
    if (initLoading) {
      initLoading.parentNode!.removeChild(initLoading);
    }
  });
