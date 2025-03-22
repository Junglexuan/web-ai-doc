import {RouteTarget} from '@elux/react-web';
import {useRouter} from '@/Global';
import {excludeDefaultParams} from '@/utils/request';
import {useEvent} from './tools';

export interface BaseListSearch {
  pageCurrent?: number;
  pageSize?: number;
  sorterOrder?: 'ascend' | 'descend';
  sorterField?: string;
}

export interface BaseListItem {
  id: string;
}

export interface BaseListSummary {
  pageCurrent: number;
  pageSize: number;
  totalItems: number;
}

export type BaseCurView = 'list' | 'item';
export type BaseCurRender = 'maintain' | 'index' | 'selector' | 'edit' | 'detail';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useTableChange<T extends BaseListSearch>(listPathname: string, defaultListSearch: T, listSearch?: T) {
  const sorterStr = [listSearch?.sorterField, listSearch?.sorterOrder].join('');
  const router = useRouter();
  return useEvent((pagination: any, filter: any, _sorter: any) => {
    const sorter = _sorter as {field: string; order: 'ascend' | 'descend' | undefined};
    const {current, pageSize} = pagination as {current: number; pageSize: number};
    const sorterField = (sorter.order && sorter.field) || undefined;
    const sorterOrder = sorter.order || undefined;
    const currentSorter = [sorterField, sorterOrder].join('');
    const pageCurrent = currentSorter !== sorterStr ? 1 : current;
    const searchQuery = excludeDefaultParams(defaultListSearch, {...listSearch, pageCurrent, pageSize, sorterField, sorterOrder});
    router.push({pathname: listPathname, searchQuery, state: router.location.state}, 'page');
  });
}
export function useSingleWindow(): RouteTarget {
  const router = useRouter();
  return router.location.classname.startsWith('_') ? 'page' : 'window';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useShowDetail(prefixPathname: string) {
  const router = useRouter();
  const onShowDetail = useEvent((id: string) => {
    router.push({url: `${prefixPathname}/item/detail/${id}`, classname: '_dialog'}, 'window');
  });
  const onShowEditor = useEvent((id: string, onSubmit: (id: string, data: Record<string, any>) => Promise<void>) => {
    router.push({url: `${prefixPathname}/item/edit/${id}`, classname: '_dialog', state: {onSubmit}}, 'window');
  });

  return {onShowDetail, onShowEditor};
}
