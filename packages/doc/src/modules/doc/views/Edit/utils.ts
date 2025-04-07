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

export function getSelectionContext(editor: IDomEditor): string {
  if (editor.selection) {
    if (editor.selection.anchor === editor.selection.focus) {
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
      return text.join('');
    } else {
      return editor.getSelectionText();
    }
  }
  return '';
}
