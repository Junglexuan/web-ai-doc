/**
 * 该文件可以看作应用的先导文件，主要用来导出一些全局常用的方法、变量、和类型
 * 注意为了避免循环依赖，请保持该文件的独立性，不要引用任何其它项目文件
 */
/// <reference path="./env.d.ts" />
import {API, Facade, getApi} from '@elux/react-web';
import type {IModuleGetter} from './Project';

interface SwitchTenantProps {
  'base-url'?: string;
  'modal-title'?: string;
  'modal-content'?: string;
  'modal-cancel-text'?: string;
  'modal-ok-text'?: string;
  'success-tips'?: string;
}

interface UserDetailProps {
  'base-url'?: string;
  title?: string;
  'skip-type'?: 'window' | 'router';
}

interface LogoutProps {
  'base-url'?: string;
  title?: string;
}

interface UserMenuProps {
  'base-url'?: string;
  title?: string;
  'skip-type'?: 'window' | 'router';
  'modal-title'?: string;
  'modal-content'?: string;
  'modal-cancel-text'?: string;
  'modal-ok-text'?: string;
  'success-tips'?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'switch-tenant': SwitchTenantProps & {
        'onswitch-tenant'?: (event: CustomEvent) => void;
        [propName: string]: any;
      };
      'user-menu': UserMenuProps & {
        'onswitch-tenant'?: (event: CustomEvent) => void;
        onlogout?: (event: CustomEvent) => void;
        [propName: string]: any;
      };
      'user-detail': UserDetailProps & {
        [propName: string]: any;
      };
      'user-logout': LogoutProps & {
        onlogout?: (event: CustomEvent) => void;
        [propName: string]: any;
      };
    }
  }

  interface HTMLElementTagNameMap {
    'switch-tenant': HTMLElement & SwitchTenantProps;
    'user-menu': HTMLElement & UserMenuProps;
    'user-detail': HTMLElement & UserDetailProps;
    'user-logout': HTMLElement & LogoutProps;
  }
}

type APP = API<Facade<IModuleGetter>>;

export type APPState = APP['State'];
export type PatchActions = APP['Actions']; // 使用demote命令兼容IE时使用

//几个全局常用的方法，参见 https://eluxjs.com/api/react-web.getapi.html
export const {Modules, LoadComponent, GetActions, GetClientRouter, useStore, useRouter} = getApi<APP>();

//脚手架编译时，会把elux.config.js中的`clientGlobalVar`值放入process.env.PROJ_ENV中，在此可以获取
//相当于在编译时就固化某些全局变量，你可以用来传递不同环境要用到的不同变量，比如url请求的前缀

export const PathPrefix: string = window['PathPrefix'] || '';
export const ApiBaseUrl: string = window['ApiBaseUrl'] || '';
export const ApiPrefix: {[key: string]: string} = window['ApiPrefix'] || {};
export const SitesUrl: {user: string; nexus: string; pulse: string; helix: string; verse: string; preview: string} = window['SitesUrl'] || {};
export const SiteInfo: {logo: string; name: string} = window['SiteInfo'] || {};

export const InIframe = window.parent !== window;

export const PublicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDO5mzmeVrQz60VonIHuZhu68ZwBtJdNFdZ+yLXMvdUadeYaVtK6go3O4QmA2T3dVnOgkApnfI3XxWAkCPhDOs0YoRlmNZF+xTAq1FHogCx2E1PpovVaRZa1rxJ8ASq/09LnMnTCtqnvov3sHcmKF3RoxAGrPhdBPpYcBPWMLJMQwIDAQAB';
