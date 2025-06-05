import {BaseCurRender, BaseCurView, BaseListItem, BaseListSearch, BaseListSummary} from '@/utils/resource';

export type CurView = BaseCurView;
export type CurRender = BaseCurRender | 'favs' | 'recs' | 'tpls';

export interface ListSearch extends BaseListSearch {
  render?: CurRender;
  id?: string;
  name?: string;
}
export interface ListItem extends BaseListItem {
  title: string;
  folderId: string;
  articleId: string;
  folderName: string;
  articleTemplateId: string;
  type: 'dir' | 'doc';
  articleCount: number;
  articleSize: number;
  updateDate: string;
  createUserName: string;
  createDate: string;
  collect: number;
  remark?: string;
  isShare?: boolean;
  isSystem?: boolean;
}
export interface ListSummary extends BaseListSummary {
  levelPath: {id: string; folderName: string; parent: string}[];
  dirTree: any[];
}

export interface ListResult {
  list: ListItem[];
  summary: ListSummary;
}

export interface ItemDetail {
  id: string;
  title: string;
  contents: string;
  articleDsl: string;
  collect: number;
  folder: string;
  createUserName: string;
  createDate: string;
  articleCount: number;
  levelPath: {id: string; folderName: string; parent: string}[];
  isTpl?: boolean;
  isShare?: boolean;
}
export interface EditItem extends BaseListItem {}

export const defaultListSearch: ListSearch = {
  pageCurrent: 1,
  pageSize: 99999,
  sorterOrder: undefined,
  sorterField: undefined,
  id: undefined,
  name: undefined,
  render: undefined,
};
