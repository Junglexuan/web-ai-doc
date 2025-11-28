import {BaseCurRender, BaseCurView, BaseListItem, BaseListSearch, BaseListSummary} from '@/utils/resource';

export type CurView = BaseCurView;
export type CurRender = BaseCurRender;

export interface ListSearch extends BaseListSearch {
  keyWord?: string;
  status?: 'start' | 'end';
}
export interface ListItem extends BaseListItem {
  name: string;
  logo: string;
  desc?: string;
  pathList: {uid: string; name: string; status: string; response: any}[];
  autoCreateFinalSheets: boolean;
  questions: {
    tpl: string;
    list: {id: string; questionName: string}[];
  };
  template: {
    id: string;
    name: string;
  };
}
export interface ListSummary extends BaseListSummary {}

export interface ListResult {
  list: ListItem[];
  summary: ListSummary;
}

export type ItemDetail = ListItem;

export type EditItem = ListItem;

export const defaultListSearch: ListSearch = {
  pageCurrent: 1,
  pageSize: 99999,
  sorterOrder: undefined,
  sorterField: undefined,
  keyWord: undefined,
};

export type TPL = {
  id: string;
  title: string;
  remark: string;
  url: string;
  isShare: string;
  createUserName: string;
  createDate: string;
};

export type DueConfigs = {
  autoCreateFinalSheets: boolean;
  roles: {
    selected: string;
    list: {value: string; name: string}[];
  };
  questions: {
    selected: string;
    tpls: {
      value: string;
      label: string;
      list: {id: string; questionName: string}[];
    }[];
  };
  template: {
    selected: {
      id: string;
      name: string;
    };
    list: TPL[];
  };
};
export interface DueSettings {
  role: string;
  autoCreateFinalSheets: boolean;
  questions: {
    tpl: string;
    list: {id: string; questionName: string}[];
  };
  template: {
    id: string;
    name: string;
  };
}
