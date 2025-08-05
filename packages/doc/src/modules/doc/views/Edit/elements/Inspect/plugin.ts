import {DomEditor, SlateEditor as Editor, IDomEditor, SlateNode as Node, SlateTransforms as Transforms} from '@wangeditor-next/editor';
//import {insertLink, isMenuDisabled} from './helper';

function withInspect<T extends IDomEditor>(editor: T): T {
  const {isInline, isVoid, insertData, normalizeNode, insertNode, insertText} = editor;
  const newEditor = editor;

  newEditor.isInline = (elem) => {
    const type = DomEditor.getNodeType(elem);
    if (type === 'inspect') {
      return true;
    }
    return isInline(elem);
  };

  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node);
    if (type !== 'inspect') {
      // 未命中 link ，执行默认的 normalizeNode
      return normalizeNode([node, path]);
    }

    // 如果链接内容为空，则删除
    const str = Node.string(node);
    if (str === '') {
      return Transforms.removeNodes(newEditor, {at: path});
    }

    return normalizeNode([node, path]);
  };

  return newEditor;
}

export default withInspect;
