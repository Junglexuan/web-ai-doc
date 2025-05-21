import {DomEditor, SlateEditor as Editor, IDomEditor, SlateNode as Node, SlateTransforms as Transforms} from '@wangeditor-next/editor';

function withVariable<T extends IDomEditor>(editor: T): T {
  const {isInline, isVoid, insertData, normalizeNode, insertNode, insertText} = editor;
  const newEditor = editor;

  newEditor.isInline = (elem) => {
    const type = DomEditor.getNodeType(elem);
    if (type === 'variable') {
      return true;
    }
    return isInline(elem);
  };

  newEditor.isVoid = (elem) => {
    const type = DomEditor.getNodeType(elem);
    if (type === 'variable') {
      return true;
    }
    return isVoid(elem);
  };

  return newEditor;
}

export default withVariable;
