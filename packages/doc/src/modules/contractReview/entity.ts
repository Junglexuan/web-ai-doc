import {BaseCurRender, BaseCurView, BaseListItem, BaseListSearch, BaseListSummary} from '@/utils/resource';

export type CurView = BaseCurView;
export type CurRender = BaseCurRender;

export interface ListSearch extends BaseListSearch {
  keyWord?: string;
  type?: number;
}
export interface ListItem extends BaseListItem {
  type: number;
  typeName: string;
  name: string;
  des: string;
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
  type: undefined,
};

export type TplsOptions = {value: string; label: string; children: {value: string; label: string}[]}[];

export type TplFields = {name: string; label: string; value: string};
