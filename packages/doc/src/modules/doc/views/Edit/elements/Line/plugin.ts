import {DomEditor, IDomEditor, SlateTransforms as Transforms} from '@wangeditor-next/editor';

function withLine<T extends IDomEditor>(editor: T): T {
  const {isVoid, normalizeNode} = editor;
  const newEditor = editor;

  newEditor.isVoid = (elem) => {
    const type = DomEditor.getNodeType(elem);

    if (type === 'line') {
      return true;
    }

    return isVoid(elem);
  };

  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node);
    if (type !== 'line') {
      // 未命中 link ，执行默认的 normalizeNode
      return normalizeNode([node, path]);
    }

    /// -------------- divider 是 editor 最后一个节点，需要后面插入 p --------------
    const isLast = DomEditor.isLastNode(newEditor, node);
    if (isLast) {
      Transforms.insertNodes(newEditor, DomEditor.genEmptyParagraph(), {at: [path[0] + 1]});
    }
  };

  return newEditor;
}

export default withLine;
