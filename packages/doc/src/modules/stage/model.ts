import {BaseModel, ErrorCodes, LoadingState, effect, reducer} from '@elux/react-web';
import {pathToRegexp} from 'path-to-regexp';
import {APPState, PathPrefix} from '@/Global';
import {AdminHomeUrl} from '@/utils/base';
import {InIframe} from '@/utils/base';
import {CustomError, ErrorCode, toLoginPage} from '@/utils/request';
import {Message} from '@/utils/tools';
import api, {guest} from './api';
import {CurView, SubModule} from './entity';
import type {LoginParams} from './entity';
import type {CurUser} from '@/utils/base';

export interface ModuleState {
  curUser: CurUser;
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
    const {subModule, curView} = this.routeParams;
    const {curUser: _curUser} = this.getPrevState() || {};
    try {
      const curUser = _curUser || (await api.getCurUser());
      const initState: ModuleState = {curUser, subModule, curView};
      this.dispatch(this.privateActions._initState(initState));
    } catch (err: any) {
      const initState: ModuleState = {curUser: {...guest}, subModule, curView, error: err.message || err.toString()};
      this.dispatch(this.privateActions._initState(initState));
    }
  }

  @effect()
  public async login(args: LoginParams): Promise<void> {
    const curUser = await api.login(args);
    this.dispatch(this.privateActions.putCurUser(curUser));
    this.getRouter().relaunch({url: this.state.fromUrl || AdminHomeUrl()}, 'window');
  }

  @reducer
  protected putCurUser(curUser: CurUser): ModuleState {
    return {...this.state, curUser};
  }

  @effect(null)
  protected async ['this._error'](error: CustomError): Promise<void> {
    if (error.code === ErrorCode.unauthorized) {
      toLoginPage(error.detail);
    } else if (error.code === ErrorCodes.ROUTE_BACK_OVERFLOW) {
      if (InIframe) {
        if (this.getRouter().location.url.includes('/admin/flow/list/maintain')) {
          console.log('退出');
          setTimeout(() => this.getRouter().back(''), 0);
        } else {
          //window.parent.postMessage({methodFunc: 'iframe:close'}, '*');
          console.log('flow:utils:closeFlow');
          //window.parent.postMessage({methodFunc: 'flow:tools', cmd: 'closeFlow', data: {changed: false}}, '*');
          window.parent.postMessage(
            {methodFunc: 'flow:utils', cmd: 'closeFlow', args: [{search: location.search, pathname: location.pathname}]},
            '*'
          );
        }
      } else {
        setTimeout(() => this.getRouter().back(''), 0);
      }
    } else if (error.message) {
      Message.error(error.message);
    }
    throw error;
  }

  private checkNeedsLogin(pathname: string): boolean {
    return ['/admin/'].some((prefix) => pathname.startsWith(prefix));
  }

  @effect(null)
  protected async ['this._testRouteChange']({url, pathname}: {url: string; pathname: string}): Promise<void> {
    if (!this.state.curUser.hasLogin && this.checkNeedsLogin(pathname)) {
      throw new CustomError(ErrorCode.unauthorized, '', url);
    }
    console.log(url);
  }
  @effect(null)
  protected async ['this._beforeRouteChange']({url, pathname}: {url: string; pathname: string}): Promise<void> {
    if (InIframe) {
      window.parent.postMessage({methodFunc: 'iframe:urlChanged', data: {url: url, hideHeader: pathname.startsWith('/admin/flow/item/edit/')}}, '*');
    }
  }
}
