import {IDomEditor, SlateEditor, createEditor} from '@wangeditor-next/editor';
import {eachTree} from '@/utils/tools';

export function dslToHtml(dsl: any): string {
  const arr = Array.isArray(dsl) ? dsl : [dsl];
  if (arr[0]) {
    const editor = createEditor({content: arr});
    return editor.getHtml();
  } else {
    return '';
  }
}

export function getSelectionContext(editor: IDomEditor): {context: string; content: string; anchor?: HTMLElement} {
  if (editor.selection) {
    let result: {context: string; content: string; anchor: HTMLElement};
    if (JSON.stringify(editor.selection.anchor) === JSON.stringify(editor.selection.focus)) {
      const [curNode] = SlateEditor.node(editor, editor.selection);
      const dsl: any[] = editor.children;
      const text: string[] = [];
      eachTree(dsl, (node) => {
        if (node.text) {
          text.push(node.text);
        }
        return node === curNode;
      });
      //SlateEditor.above(editor, {at: editor.selection, match: (n) => SlateEditor.isBlock(editor, n) || SlateEditor.isEditor(n)});
      result = {context: text.join(''), content: '', anchor: editor.toDOMNode(curNode)};
    } else {
      console.log(editor.selection);
      const [anchor] = SlateEditor.node(editor, editor.selection.anchor);
      const [focus] = SlateEditor.node(editor, editor.selection.focus);
      const anchorDom = editor.toDOMNode(anchor);
      const focusDom = editor.toDOMNode(focus);
      const anchorRect = anchorDom.getBoundingClientRect();
      const focusRect = focusDom.getBoundingClientRect();
      result = {
        context: editor.getSelectionText(),
        content: editor.getSelectionText(),
        anchor: anchorRect.top > focusRect.top ? anchorDom : focusDom,
      };
    }
    //const placeholder
    return result;
  }
  return {context: '', content: ''};
}
