/* eslint-disable no-useless-catch */
import {RouteTarget} from '@elux/react-web';
import {Modal, message} from 'antd';
import {Rule} from 'antd/lib/form';
import {produce} from 'immer';
import {useCallback, useMemo, useRef} from 'react';
import {PathPrefix, useRouter} from '@/Global';

export {message} from 'antd';

message.config({top: 47});
export function confirm(
  message: string,
  callback: (ok: boolean) => void,
  props?: {title?: string; okText?: string; cancelText?: string | null}
): void {
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
export function warning(message: string, callback: () => void): void {
  Modal.warning({
    title: '提示',
    content: message,
    okText: '确定',
    onOk() {
      callback();
    },
  });
}
export function info(message: string, callback: () => void): void {
  Modal.info({
    title: '提示',
    content: message,
    okText: '确定',
    onOk() {
      callback();
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

export function toNativeUrl(url: string): string {
  return PathPrefix + url;
}

export function openArticle(url: string): void {
  //GetClientRouter().push({url}, 'window');
  window.open(toNativeUrl(url), url);
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

export function recurseTree<T extends AbsTreeItem>(tree: T, before: (item: T) => boolean | void, after: (item: T) => void): boolean | undefined {
  const hasChildren = Boolean(tree.children && tree.children.length);
  const result = before(tree);
  if (result) {
    after(tree);
    return true;
  }
  if (hasChildren) {
    const arr = tree.children!;
    for (let i = 0, k = arr.length; i < k; i++) {
      const item = arr[i] as T;
      if (recurseTree(item, before, after)) {
        after(tree);
        return true;
      }
    }
  }
  after(tree);
  return undefined;
}

export interface AbsTreeItem {
  children?: AbsTreeItem[];
}

function _mapTree<T extends AbsTreeItem, V extends {children?: V[]}>(
  tree: T[],
  reduce: (item: T, index: number, parent: V | undefined, level: number) => V,
  curLevel: number,
  parent: V | undefined
): V[] {
  return tree.map((item, index) => {
    const newItem = reduce(item, index, parent, curLevel);
    if (item.children) {
      newItem.children = _mapTree(item.children as T[], reduce, curLevel + 1, newItem);
    }
    return newItem;
  });
}

export function mapTree<T extends AbsTreeItem, V extends {children?: V[]}>(
  tree: T[],
  reduce: (item: T, index: number, parent: V | undefined, level: number) => V
): V[] {
  return _mapTree(tree, reduce, 1, undefined);
}

export function createAutoId(ids: string[]): () => number {
  const nums = ids.map((id) => Number(id.split('_').pop()) || 0);
  let start = nums.length ? Math.max(...nums) : 0;
  return () => {
    return start++;
  };
}

export const getToken = (): string => {
  //const [agencyID, token] = (localStorage.getItem(TokenStorageKey) || '').split('|');
  const token = localStorage.getItem('zov-user-token') || '';
  //
  return token;
};

export const getTenant = (): string => {
  //const [agencyID, token] = (localStorage.getItem(TokenStorageKey) || '').split('|');
  const token = localStorage.getItem('zov-user-tenant') || '';
  //
  return token;
};

export const clearToken = (): void => {
  localStorage.removeItem('zov-user-token');
  localStorage.removeItem('zov-user-tenant');
  localStorage.removeItem('zov-user-info');
};

export const getCurUserId = (): string => {
  const info = localStorage.getItem('zov-user-info');
  const user = info ? JSON.parse(info) : {};
  return user.id || '';
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
export function debounce<T extends Function>(callbak: T, delay = 0, every?: T): T {
  let timer: any = null;
  return ((...args: any[]) => {
    every && every(...args);
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      callbak(...args);
      timer = null;
    }, delay);
  }) as any;
}
const DslTagMap: {[key: string]: string} = {
  header1: 'h1',
  header2: 'h2',
};
export function dslNodeToHtml(dsl: {type: string}, end?: boolean): string {
  if (end) {
    return `</${DslTagMap[dsl.type] || 'span'}>`;
  }
  return `<${DslTagMap[dsl.type] || 'span'}>`;
}

// type ThrottledFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

// export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): ThrottledFunction<T> {
//   let lastExecTime = 0;
//   let timer: ReturnType<typeof setTimeout> | null = null;
//   let lastArgs: Parameters<T>;

//   return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
//     const now = Date.now();
//     const remaining = delay - (now - lastExecTime);
//     lastArgs = args;

//     if (remaining <= 0) {
//       if (timer) {
//         clearTimeout(timer);
//         timer = null;
//       }
//       lastExecTime = now;
//       fn.apply(this, args);
//     } else if (!timer) {
//       timer = setTimeout(() => {
//         lastExecTime = Date.now();
//         timer = null;
//         fn.apply(this, lastArgs);
//       }, remaining);
//     }
//   };
// }

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function closestTarget(el: HTMLElement, find: (dom: HTMLElement) => boolean, root: HTMLElement, limit: number = 9999): HTMLElement | null {
  let n = 0;
  do {
    n++;
    if (find(el)) {
      return el;
    }
    el = el.parentElement as any;
  } while (el && el !== root && n < limit);
  return null;
}

export function setFavicon(url: string): void {
  const link = document.querySelector("link[rel*='icon']") as any;
  if (link) {
    link.href = url;
  }
}

/**
 * 节流函数 (throttle)
 * @param func 要执行的函数
 * @param wait 节流时间间隔(毫秒)
 * @param options 配置选项
 * @param options.leading 是否在节流开始时调用 (默认true)
 * @param options.trailing 是否在节流结束后调用 (默认true)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {leading?: boolean; trailing?: boolean} = {}
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;
  let result: ReturnType<T>;

  const {leading = true, trailing = true} = options;

  const invokeFunc = (args: Parameters<T>) => {
    result = func(...args);
    lastCallTime = Date.now();
    timeout = null;
    lastArgs = null;
    return result;
  };

  const shouldInvoke = () => {
    if (lastCallTime === null) return true;
    const timeSinceLastCall = Date.now() - lastCallTime;
    return timeSinceLastCall >= wait;
  };

  const trailingEdge = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (trailing && lastArgs) {
      return invokeFunc(lastArgs);
    }
    lastArgs = null;
    return result;
  };

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const shouldCallLeading = leading && lastCallTime === null;

    lastArgs = args;

    if (shouldInvoke()) {
      if (timeout) {
        trailingEdge();
      }
      if (shouldCallLeading) {
        return invokeFunc(args);
      }
      // 设置定时器，确保 trailing 调用
      timeout = setTimeout(trailingEdge, wait);
    } else if (!timeout && trailing) {
      // 确保最后一次调用会被执行
      timeout = setTimeout(trailingEdge, wait - (Date.now() - (lastCallTime || 0)));
    }

    return result;
  };
}

export async function readClipboardHTML(): Promise<string | null> {
  try {
    // 检查浏览器是否支持Clipboard API
    if (!navigator.clipboard || !navigator.clipboard.read) {
      throw new Error('您的浏览器不支持剪贴板读取功能。');
    }

    // 读取剪贴板内容
    const clipboardItems = await navigator.clipboard.read();

    // 遍历剪贴板项目，查找HTML内容
    for (const clipboardItem of clipboardItems) {
      // 检查是否包含HTML类型
      if (clipboardItem.types.includes('text/html')) {
        // 获取HTML内容
        const htmlBlob = await clipboardItem.getType('text/html');
        const htmlText = await htmlBlob.text();
        return htmlText;
      }
    }

    // 如果没有找到HTML内容
    return null;
  } catch (error) {
    throw error;
  }
}
