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
  desc: string;
  progress: number;
  pathList: {uid: string; name: string; status: string; url: string; thumbUrl: string}[];
  autoCreateFinalSheets: boolean;
  questions: {
    tpl: string;
    list: {id: string; questionName: string}[];
  };
  template: {
    id: string;
    name: string;
  };
  status: string;
}
export interface ListSummary extends BaseListSummary {}

export interface ListResult {
  list: ListItem[];
  summary: ListSummary;
}

export interface ItemDetail {
  id: string;
  name: string;
  logo: string;
  desc: string;
  status: string;
  progress: number;
  updateDate?: string;
  // 报告
  report: {
    id: string;
    fileName: string;
    fileUrl: string;
    wordCount: number;
    updateTime: string;
    type: string;
    lastModifiedTime: string;
    matchNum: number;
    relationId: string;
    total: number;
    owner: string;
  };
  calculation: {
    id: string;
    fileName: string;
    fileUrl: string;
    type: string;
  };
  // 准备资料
  resources: {
    id: string;
    fileName: string;
    fileUrl: string;
    type: string;
    lastModifiedTime: string;
  }[];
  // 补充资料
  supplementary: {
    id: string;
    fileName: string;
    fileUrl: string;
    type: string;
    lastModifiedTime: string;
  }[];
  // 访谈资料
  interviewInstList: {
    id: string;
    fileName: string;
    fileUrl: string;
    type: string;
    lastModifiedTime: string;
  }[];
}

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

export const StatusMap: {[key: string]: string} = {
  '1': '准备中',
  '2': '访谈中',
  '3': '完善中',
  '4': '已结束',
};
