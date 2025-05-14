import {DomEditor, SlateEditor as Editor, IDomEditor, SlateNode as Node, SlateTransforms as Transforms} from '@wangeditor-next/editor';
//import {insertLink, isMenuDisabled} from './helper';

function withReview<T extends IDomEditor>(editor: T): T {
  const {isInline, isVoid, insertData, normalizeNode, insertNode, insertText} = editor;
  const newEditor = editor;

  newEditor.isInline = (elem) => {
    const type = DomEditor.getNodeType(elem);
    if (type === 'review') {
      return true;
    }
    return isInline(elem);
  };

  return newEditor;
}

export default withReview;
