import {IDomEditor, SlateEditor, SlateElement, SlateNode, createEditor} from '@wangeditor-next/editor';
import {eachTree, insertAfter} from '@/utils/tools';

export interface ISelection {
  pos: {x: number; y: number};
  context: string;
  content: string;
  begin: HTMLElement;
  end: HTMLElement;
  placeholder: HTMLElement;
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

export function getSelectionContext(editor: IDomEditor): {
  context: string;
  content: string;
  begin: HTMLElement;
  end: HTMLElement;
  placeholder: HTMLElement;
} | null {
  if (editor.selection) {
    let result: {context: string; content: string; begin: HTMLElement; end: HTMLElement; placeholder: HTMLElement};
    if (JSON.stringify(editor.selection.anchor) === JSON.stringify(editor.selection.focus)) {
      const [curNode] = SlateEditor.node(editor, editor.selection);
      const curDom = editor.toDOMNode(curNode);
      const dsl: any[] = editor.children;
      const text: string[] = [];
      eachTree(dsl, (node) => {
        if (node.text) {
          text.push(node.text);
        }
        return node === curNode;
      });
      //SlateEditor.above(editor, {at: editor.selection, match: (n) => SlateEditor.isBlock(editor, n) || SlateEditor.isEditor(n)});
      result = {context: text.join(''), content: '', begin: curDom, end: curDom} as any;
    } else {
      // const nodeEntries = SlateEditor.nodes(editor, {mode: 'lowest'});
      // if (nodeEntries) {
      //   for (const nodeEntry of nodeEntries) {
      //     const [node, path] = nodeEntry;
      //     console.log('选中了 paragraph 节点', node);
      //     console.log('节点 path 是', path);
      //   }
      // }
      const [anchor] = SlateEditor.node(editor, editor.selection.anchor);
      const [focus] = SlateEditor.node(editor, editor.selection.focus);
      const anchorDom = editor.toDOMNode(anchor);
      const focusDom = editor.toDOMNode(focus);
      const anchorRect = anchorDom.getBoundingClientRect();
      const focusRect = focusDom.getBoundingClientRect();
      result = {
        context: editor.getSelectionText(),
        content: editor.getSelectionText(),
      } as any;
      if (anchorRect.top < focusRect.top) {
        result.begin = anchorDom;
        result.end = focusDom;
      } else {
        result.begin = focusDom;
        result.end = anchorDom;
      }
    }
    const placeholder = document.createElement('div') as HTMLElement;
    placeholder.id = '_ai_placeholder';
    insertAfter(placeholder, result.end);
    result.placeholder = placeholder;
    return result;
  }
  return null;
}
