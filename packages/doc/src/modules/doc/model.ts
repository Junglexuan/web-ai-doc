//定义本模块的业务模型
import {BaseModel, LoadingState, effect, reducer} from '@elux/react-web';
import {pathToRegexp} from 'path-to-regexp';
import {APPState, PathPrefix} from '@/Global';
import {mergeDefaultParams} from '@/utils/request';
import DocAPI from './api';
import {defaultListSearch} from './entity';
import type {CurRender, CurView, ItemDetail, ListItem, ListSearch, ListSummary} from './entity';

//定义本模块的状态结构
export interface ModuleState {
  curView?: CurView;
  curRender?: CurRender;
  listSearch?: ListSearch;
  list?: ListItem[];
  listSummary?: ListSummary;
  listLoading?: LoadingState;
  itemId?: string;
  itemDetail?: ItemDetail;
}

//定义路由中的本模块感兴趣的信息
export interface RouteParams {
  curView?: CurView;
  curRender?: CurRender;
  query: {[key: string]: string};
  listSearch?: ListSearch;
  itemId?: string;
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
    const {pathname, searchQuery} = this.getRouter().location;
    const [, admin = '', subModule = '', curViewStr = '', curRenderStr = '', id = ''] =
      pathToRegexp('/:admin/:subModule/:curView/:curRender/:id?').exec(pathname.replace(PathPrefix, '')) || [];
    const curView = curViewStr as CurView;
    const curRender = curRenderStr as CurRender;
    const routeParams: RouteParams = {curView, query: searchQuery};
    if (curView === 'list') {
      routeParams.curRender = curRender || 'maintain';
      const listQuery = this.parseListQuery(searchQuery);
      routeParams.listSearch = mergeDefaultParams(defaultListSearch, listQuery);
    } else if (curView === 'item') {
      routeParams.curRender = curRender || 'detail';
      routeParams.itemId = id;
    }
    return routeParams;
  }

  public onMount(): void {
    this.routeParams = this.getRouteParams();
    const {curView, curRender, listSearch, itemId} = this.routeParams;
    this.dispatch(
      this.privateActions._initState({
        curView,
        curRender,
        listSearch,
        itemId,
      })
    );
    if (curView === 'list') {
      this.dispatch(this.actions.fetchList({...listSearch, render: curRender}));
    } else if (curView === 'item') {
      this.dispatch(this.actions.fetchItem(itemId || ''));
    }
  }

  @reducer
  public putList(listSearch: ListSearch, list: ListItem[], listSummary: ListSummary): ModuleState {
    return {...this.state, listSearch, list, listSummary};
  }

  @effect()
  public async fetchList(listSearchData?: ListSearch): Promise<void> {
    const listSearch = listSearchData || this.state.listSearch || defaultListSearch;
    const {list, summary: listSummary} = await DocAPI.getList(listSearch);
    this.dispatch(this.actions.putList(listSearch, list, listSummary));
  }

  @reducer
  public putCurrentItem(itemId = '', itemDetail: ItemDetail): ModuleState {
    return {...this.state, itemId, itemDetail};
  }

  @effect()
  public async fetchItem(itemId: string): Promise<void> {
    const item = await DocAPI.getDoc({id: itemId});
    this.dispatch(this.actions.putCurrentItem(itemId, item));
  }
}
