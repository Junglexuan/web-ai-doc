import {createEditor} from '@wangeditor-next/editor';

export interface AIEvent {
  key: string;
  pos: {x: number; y: number};
  context: string;
  content: string;
  // begin: HTMLElement;
  // end: HTMLElement;
  placeholder: HTMLElement;
}

export interface AIInputRef {
  getValue: () => string;
}

export function dslToHtml(dsl: any): string {
  const arr = Array.isArray(dsl) ? dsl : [dsl];
  if (arr[0]) {
    const editor = createEditor({content: arr});
    return editor.getHtml();
  } else {
    return '';
  }
}

export function htmlToDsl(html: string): string {
  if (html) {
    const editor = createEditor({html});
    return JSON.stringify(editor.children);
  }
  return '';
}
