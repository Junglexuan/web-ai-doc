import {RouteTarget} from '@elux/react-web';
import {Modal, message} from 'antd';
import {Rule} from 'antd/lib/form';
import {produce} from 'immer';
import {useCallback, useMemo, useRef} from 'react';
import {useRouter} from '@/Global';

export {message} from 'antd';

message.config({top: 47});
export function confirm(message: string, callback: (ok: boolean) => void, props?: {title?: string; okText?: string; cancelText?: string}): void {
  Modal.confirm({
    title: '提示',
    content: message,
    ...props,
    onOk() {
      callback(true);
    },
    onCancel() {
      callback(false);
    },
  });
}
export function hasClass(el: HTMLElement, className: string): boolean {
  const arr = (el.getAttribute('class') || '').split(' ');
  return arr.includes(className);
}
export function addClass(el: HTMLElement, className: string): void {
  const arr = (el.getAttribute('class') || '').split(' ');
  if (!arr.includes(className)) {
    arr.push(className);
  }
  el.setAttribute('class', arr.join(' '));
}
export function removeClass(el: HTMLElement, className: string): void {
  const arr = (el.getAttribute('class') || '').split(' ').filter((item) => item !== className);
  el.setAttribute('class', arr.join(' '));
}

export function insertAfter(newElement: HTMLElement, targetElement: HTMLElement): void {
  const parent = targetElement.parentNode!; // 获取目标节点的父级元素
  if (parent.lastChild == targetElement) {
    // 如果目标节点是父节点的最后一个子节点，则使用appendChild()方法
    parent.appendChild(newElement);
  } else {
    // 否则，使用insertBefore()方法在目标节点的下一个兄弟节点前插入新节点
    parent.insertBefore(newElement, targetElement.nextSibling);
  }
}

export type UNListener = () => void;

export class SimpleDispatcher<T extends {[event: string]: any}> {
  protected _listenerId = 0;

  constructor(protected readonly _listenerMap: Record<keyof T, {}>) {}

  addListener<E extends keyof T>(event: E, callback: (data: T[E]) => void): UNListener {
    const eventName = event as string;
    const handlerMap = this._listenerMap[eventName];
    if (handlerMap) {
      this._listenerId++;
      const id = `${this._listenerId}`;
      handlerMap[id] = callback;
      return () => {
        delete handlerMap[id];
      };
    }
    throw `event[${eventName}] not found`;
  }

  dispatch<E extends keyof T>(event: E, data: T[E]): void {
    const eventName = event as string;
    const handlerMap = this._listenerMap[eventName];
    if (handlerMap) {
      Object.keys(handlerMap).forEach((id) => {
        handlerMap[id]?.(data);
      });
    }
  }
}

export function useEvent<F extends Function>(handler: F): F {
  const handlerRef = useRef<F>();
  handlerRef.current = useMemo(() => handler, [handler]);

  return useCallback((...args: any) => {
    return handlerRef.current!(...args);
  }, []) as any;
}

export function useSingleWindow(): RouteTarget {
  const router = useRouter();
  return router.location.classname.startsWith('_') ? 'page' : 'window';
}

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export interface TreeItem {
  id: string;
  folded?: boolean;
  hlight?: boolean;
  children?: TreeItem[];
}

function _eachTree<T extends TreeItem>(
  tree: T[],
  reduce: (item: T, index: number, parent: T | undefined, level: number) => boolean | void,
  curLevel: number,
  parent: T | undefined
): boolean | undefined {
  let index = -1;
  for (const item of tree) {
    index++;
    if (reduce(item, index, parent, curLevel)) {
      return true;
    }
    if (item.children && item.children.length) {
      if (_eachTree(item.children as T[], reduce, curLevel + 1, item)) {
        return true;
      }
    }
  }
  return undefined;
}

export function produceTree<T extends TreeItem>(
  tree: T[],
  reduce: (item: T, index: number, parent: T | undefined, level: number) => boolean | void,
  onEnd?: (tree: T[]) => void
): T[] {
  return produce(tree, (draft) => {
    _eachTree(draft as T[], reduce, 1, undefined);
    if (onEnd) {
      onEnd(draft as T[]);
    }
  });
}

function _findInTree<T extends TreeItem>(
  tree: T[],
  reduce: (item: T, index: number, parent: T | undefined, level: number) => boolean,
  curLevel: number,
  parent: T | undefined
): T | undefined {
  let index = -1;
  for (const item of tree) {
    index++;
    if (reduce(item, index, parent, curLevel)) {
      return item;
    }
    if (item.children && item.children.length) {
      const result = _findInTree(item.children as T[], reduce, curLevel + 1, item);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

export function findInTree<T extends TreeItem>(
  tree: T[],
  reduce: (item: T, index: number, parent: T | undefined, level: number) => boolean
): T | undefined {
  return _findInTree(tree, reduce, 1, undefined);
}

export function eachTree<T extends TreeItem>(
  tree: T[],
  reduce: (item: T, index: number, parent: T | undefined, level: number) => boolean | void
): void {
  _eachTree(tree, reduce, 1, undefined);
}

export function createAutoId(ids: string[]): () => number {
  const nums = ids.map((id) => Number(id.split('_').pop()) || 0);
  let start = nums.length ? Math.max(...nums) : 0;
  return () => {
    return start++;
  };
}

class GlobalDispatcher extends SimpleDispatcher<{message: {type: 'success' | 'error'; text: string}}> {
  constructor() {
    super({message: {}});
  }
}

export const globalDispatcher = new GlobalDispatcher();

export const Message = {
  success(text: string): void {
    globalDispatcher.dispatch('message', {type: 'success', text});
  },
  error(text: string): void {
    globalDispatcher.dispatch('message', {type: 'error', text});
  },
};

export const getToken = (): any => {
  //const [agencyID, token] = (localStorage.getItem(TokenStorageKey) || '').split('|');
  const token = localStorage.getItem('zov-user-token') || '';
  const info = localStorage.getItem('zov-user-info') || '';
  const user = info ? JSON.parse(info) : {};
  return {agencyID: user.agencyID || '', token};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function countPagination(pageCurrent: number, totalItems: number, pageSize: number) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  if (pageCurrent > totalPages) {
    pageCurrent = totalPages;
  }
  const from = (pageCurrent - 1) * pageSize;
  const to = from + pageSize;
  return {pageCurrent, pageSize, totalItems, totalPages, from: from + 1, to};
}

export interface FormDecorator<T = string> {
  label?: string;
  dependencies?: T[];
  rules?: Rule[];
  valuePropName?: string;
}

export function getFormDecorators<TFormData>(items: {[key in keyof TFormData]: FormDecorator<keyof TFormData>}): {
  [key in keyof TFormData]: FormDecorator<keyof TFormData> & {name: string};
} {
  Object.entries(items).forEach(([key, item]: [string, any]) => {
    item.name = key;
  });
  return items as any;
}
export const getUrlParam = (name: string): string | null => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); //构造一个含有目标参数的正则表达式对象
  const r = window.location.search.substr(1).match(reg); //匹配目标参数
  if (r != null && decodeURI(r[2]) != 'null') return decodeURI(r[2]);
  return null; //返回参数值
};
export function debounce<T extends Function>(callbak: T, delay = 0): T {
  let timer: any = null;
  return ((...args: any[]) => {
    //every && every(...args);
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      callbak(...args);
      timer = null;
    }, delay);
  }) as any;
}
export function throttle<T extends Function>(callbak: T, delay = 0): T {
  let inThrottle: any;
  return ((...args: any[]) => {
    if (!inThrottle) {
      callbak(...args);
      inThrottle = true;
      setTimeout(function () {
        inThrottle = false;
      }, delay);
    }
  }) as any;
}
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
