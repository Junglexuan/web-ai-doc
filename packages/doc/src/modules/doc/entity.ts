import {BaseCurRender, BaseCurView, BaseListItem, BaseListSearch, BaseListSummary} from '@/utils/resource';

export type CurView = BaseCurView;
export type CurRender = BaseCurRender;

export interface ListSearch extends BaseListSearch {
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
  collect: number;
}
export interface ListSummary extends BaseListSummary {}

export interface ListResult {
  list: ListItem[];
  summary: ListSummary;
}

export interface ItemDetail {
  id: string;
  title: string;
  contents: string;
}
export interface EditItem extends BaseListItem {}

export const defaultListSearch: ListSearch = {
  pageCurrent: 1,
  pageSize: 99999,
  sorterOrder: undefined,
  sorterField: undefined,
  id: undefined,
};
