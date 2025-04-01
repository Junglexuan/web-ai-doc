import {IDomEditor, SlateEditor, createEditor} from '@wangeditor-next/editor';
import {eachTree} from '@/utils/tools';

export function dslToHtml(dsl: any): string {
  const editor = createEditor({content: Array.isArray(dsl) ? dsl : [dsl]});
  return editor.getHtml();
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
