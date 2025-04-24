import {BaseCurRender, BaseCurView, BaseListItem, BaseListSearch, BaseListSummary} from '@/utils/resource';

export type CurView = BaseCurView;
export type CurRender = BaseCurRender | 'favs';

export interface ListSearch extends BaseListSearch {
  render?: CurRender;
  id?: string;
}
export interface ListItem extends BaseListItem {
  title: string;
  folderId: string;
  articleId: string;
  folderName: string;
  type: 'dir' | 'doc';
  articleCount: number;
  articleSize: number;
  updateDate: string;
  createUserName: string;
  collect: number;
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
  levelPath: {id: string; folderName: string; parent: string}[];
}
export interface EditItem extends BaseListItem {}

export const defaultListSearch: ListSearch = {
  pageCurrent: 1,
  pageSize: 99999,
  sorterOrder: undefined,
  sorterField: undefined,
  id: undefined,
  render: undefined,
};
