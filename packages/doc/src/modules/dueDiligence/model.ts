//定义本模块的业务模型
import {BaseModel, LoadingState, effect, reducer} from '@elux/react-web';
import {pathToRegexp} from 'path-to-regexp';
import {APPState, PathPrefix} from '@/Global';
import {mergeDefaultParams} from '@/utils/request';
import DueDiligenceAPI from './api';
import {defaultListSearch} from './entity';
import type {CurRender, CurView, ItemDetail, ListItem, ListSearch, ListSummary, ReportRecord} from './entity';

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
  reportList?: ReportRecord[];
  reportListTotal?: number;
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
  }

  public onActive(): void {
    const routeParams = this.getRouteParams();
    const {curView, curRender, listSearch, itemId} = routeParams;
    if (curView === 'list') {
      if (curRender === 'maintain') {
        this.dispatch(this.actions.fetchList(listSearch));
      } else if (curRender === 'report') {
        this.dispatch(this.actions.fetchReportList(listSearch));
      }
    } else if (curView === 'item') {
      this.dispatch(this.actions.fetchItem(itemId || '', curRender));
    }
  }

  @reducer
  public putList(listSearch: ListSearch, list: ListItem[], listSummary: ListSummary): ModuleState {
    return {...this.state, listSearch, list, listSummary};
  }

  @effect()
  public async fetchList(listSearchData?: ListSearch): Promise<void> {
    const listSearch = listSearchData || this.state.listSearch || defaultListSearch;
    const {list, summary: listSummary} = await DueDiligenceAPI.getList(listSearch);
    this.dispatch(this.actions.putList(listSearch, list, listSummary));
  }

  @reducer
  public putCurrentItem(itemId = '', itemDetail: ItemDetail): ModuleState {
    return {...this.state, itemId, itemDetail};
  }

  @reducer
  public putReportList(reportList: ReportRecord[], reportListTotal: number, listSearch: ListSearch): ModuleState {
    return {...this.state, reportList, reportListTotal, listSearch};
  }

  @effect()
  public async fetchReportList(listSearchData?: ListSearch): Promise<void> {
    const listSearch = listSearchData || this.state.listSearch || defaultListSearch;
    const {list, total} = await DueDiligenceAPI.queryDealReportListByPage({
      pageNo: listSearch.pageCurrent || 1,
      pageSize: listSearch.pageSize || 20,
      fileName: listSearch.keyWord,
    });
    this.dispatch(this.actions.putReportList(list, total, listSearch));
  }

  @effect()
  public async fetchItem(itemId: string, render?: CurRender): Promise<void> {
    const item = await DueDiligenceAPI.getItem(itemId);
    this.dispatch(this.actions.putCurrentItem(itemId, item));
  }
}
