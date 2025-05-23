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

  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node);
    if (type !== 'variable') {
      return normalizeNode([node, path]);
    }

    const str = Node.string(node);
    if (str === '') {
      return Transforms.removeNodes(newEditor, {at: path});
    }

    return normalizeNode([node, path]);
  };

  return newEditor;
}

export default withVariable;
