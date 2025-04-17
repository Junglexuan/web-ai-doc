//定义本模块的业务模型
import {BaseModel, LoadingState} from '@elux/react-web';
import {APPState} from '@/Global';

//定义本模块的状态结构
export interface ModuleState {}

//定义路由中的本模块感兴趣的信息
export interface RouteParams {
  query: {[key: string]: string};
}

export class Model extends BaseModel<ModuleState, APPState> {
  protected routeParams!: RouteParams;
  protected privateActions = this.getPrivateActions({});

  protected parseListQuery(query: Record<string, string | undefined>): Record<string, any> {
    const data = {...query} as Record<string, any>;
    if (query.pageCurrent) {
      data.pageCurrent = parseInt(query.pageCurrent) || undefined;
    }
    return data;
  }
  protected getRouteParams(): RouteParams {
    const {searchQuery} = this.getRouter().location;
    const routeParams: RouteParams = {query: searchQuery};
    return routeParams;
  }

  public onMount(): void {
    this.routeParams = this.getRouteParams();
    this.dispatch(this.privateActions._initState({}));
  }
}
