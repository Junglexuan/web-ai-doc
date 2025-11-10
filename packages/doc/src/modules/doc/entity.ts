import {BaseCurRender, BaseCurView, BaseListItem, BaseListSearch, BaseListSummary} from '@/utils/resource';

export type CurView = BaseCurView;
export type CurRender = BaseCurRender | 'favs' | 'recs' | 'tpls' | 'tpls_' | 'conts';
export type DocType = 'dir' | 'doc' | 'tpl' | 'con';

export interface ListSearch extends BaseListSearch {
  render?: CurRender;
  id?: string;
  name?: string;
  type?: string;
  owner?: string;
  cate?: string;
}
export interface ListItem extends BaseListItem {
  title: string;
  folderId: string;
  articleId: string;
  folderName: string;
  articleTemplateId: string;
  type: DocType;
  articleCount: number;
  articleSize: number;
  updateDate: string;
  createUser: string;
  createUserName: string;
  createDate: string;
  collect: number;
  format?: string;
  remark?: string;
  isShare?: boolean;
  isSystem?: boolean;
  isMine?: boolean;
  snapshot?: string;
}
export interface ListSummary extends BaseListSummary {
  levelPath: {id: string; folderName: string; parent: string}[];
  dirTree: any[];
  typesTree: {ID: string; title: string; children: {ID: string; title: string}[]}[];
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
  snapshot: string;
  collect: number;
  folder: string;
  createUser: string;
  createUserName: string;
  createDate: string;
  articleCount: number;
  size: '常规' | '全宽' | '超宽';
  levelPath: {id: string; folderName: string; parent: string}[];
  docType: DocType;
  format?: string;
  isShare?: boolean;
  isSystem?: boolean;
  isMine?: boolean;
  readonly?: boolean;
  wordPlugin?: {type: string; title: string; remark: string; attribute: string; id: string}[];
}
export interface EditItem extends BaseListItem {}

export const defaultListSearch: ListSearch = {
  pageCurrent: 1,
  pageSize: 99999,
  sorterOrder: undefined,
  sorterField: undefined,
  id: undefined,
  name: undefined,
  type: undefined,
  render: undefined,
  owner: undefined,
};
export type TplsOptions = {value: string; label: string; children: {value: string; label: string}[]}[];

export type TplFields = {name: string; label: string; holdplace: string; value: string};
