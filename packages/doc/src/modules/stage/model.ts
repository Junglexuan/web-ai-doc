import {BaseModel, ErrorCodes, LoadingState, effect, reducer} from '@elux/react-web';
import {pathToRegexp} from 'path-to-regexp';
import {APPState, PathPrefix} from '@/Global';
import {InIframe} from '@/utils/base';
import {CustomError, ErrorCode, toLoginPage} from '@/utils/request';
import {message} from '@/utils/tools';
import api, {guest} from './api';
import {CurView, SubModule} from './entity';
import type {CurUser} from '@/utils/base';

/** 尽调溯源页：不请求 currentUser，可免登录访问；仅影响此路径 */
const TRACE_PAGE_PREFIX = '/admin/dueDiligence/list/trace';

export interface ModuleState {
  curUser: CurUser;
  siteConfig: any;
  subModule?: SubModule;
  curView?: CurView;
  globalLoading?: LoadingState;
  fromUrl?: string;
  error?: string;
}
export interface RouteParams {
  pathname: string;
  query: {[key: string]: string};
  subModule?: SubModule;
  curView?: CurView;
  token?: string;
  fromUrl?: string;
}

export class Model extends BaseModel<ModuleState, APPState> {
  protected routeParams!: RouteParams;

  protected privateActions = this.getPrivateActions({putCurUser: this.putCurUser});

  protected getRouteParams(): RouteParams {
    const {pathname, searchQuery} = this.getRouter().location;
    const [, subModuleStr = '', curViewStr = ''] =
      pathToRegexp('/:subModule/:curView', undefined, {end: false}).exec(pathname.replace(PathPrefix, '')) || [];
    const subModule: SubModule | undefined = SubModule[subModuleStr] || undefined;
    const curView: CurView | undefined = CurView[curViewStr] || undefined;
    const token: string | undefined = searchQuery.from;
    return {pathname, subModule, curView, token, query: searchQuery};
  }

  public async onMount(): Promise<void> {
    this.routeParams = this.getRouteParams();
    const {subModule, curView, query, pathname} = this.routeParams;
    const pathWithoutPrefix = pathname.replace(PathPrefix, '');
    const isTracePage = pathWithoutPrefix.startsWith(TRACE_PAGE_PREFIX);
    const {ticket = '', from = ''} = pathname.endsWith('/stage/login') ? query : {};
    const {curUser: _curUser, siteConfig: _siteConfig} = this.getPrevState() || {};
    try {
      const curUser = isTracePage ? (_curUser || guest) : _curUser || (await api.getCurUser(ticket, from));
      const siteConfig = _siteConfig || (await api.getSiteConfig());
      const initState: ModuleState = {curUser, siteConfig, subModule, curView};
      this.dispatch(this.privateActions._initState(initState));
    } catch (err: any) {
      if (err.code === '402' || err.code === '502') {
        throw err;
      }
      const initState: ModuleState = {curUser: {...guest}, siteConfig: {}, subModule, curView, error: err.message || err.toString()};
      this.dispatch(this.privateActions._initState(initState));
    }
  }

  @reducer
  protected putCurUser(curUser: CurUser): ModuleState {
    return {...this.state, curUser};
  }

  @effect()
  public async logout(): Promise<void> {
    const curUser = await api.logout();
    this.dispatch(this.privateActions.putCurUser(curUser));
    toLoginPage();
    //this.getRouter().relaunch({url: this.state.fromUrl || AdminHomeUrl()}, 'window');
  }

  @effect(null)
  protected async ['this._error'](error: CustomError): Promise<void> {
    if (error.code === ErrorCode.unauthorized) {
      toLoginPage(error.detail);
    } else if (error.code === ErrorCodes.ROUTE_BACK_OVERFLOW) {
      setTimeout(() => (location.href = '/admin/home'));
    } else if (error.message) {
      message.error(error.message);
    }
    throw error;
  }

  private checkNeedsLogin(pathname: string): boolean {
    const pathWithoutPrefix = pathname.replace(PathPrefix, '');
    if (pathWithoutPrefix.startsWith(TRACE_PAGE_PREFIX)) return false;
    return ['/admin/'].some((prefix) => pathname.startsWith(prefix));
  }

  @effect(null)
  protected async ['this._testRouteChange']({url, pathname}: {url: string; pathname: string}): Promise<void> {
    if (!this.state.curUser.hasLogin && this.checkNeedsLogin(pathname)) {
      throw new CustomError(ErrorCode.unauthorized, '', (PathPrefix || '') + url);
    }
  }
  @effect(null)
  protected async ['this._beforeRouteChange']({url, pathname}: {url: string; pathname: string}): Promise<void> {
    if (InIframe) {
      window.parent.postMessage({methodFunc: 'iframe:urlChanged', data: {url: url, hideHeader: pathname.startsWith('/admin/flow/item/edit/')}}, '*');
    }
  }
}
