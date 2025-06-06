import {DomEditor, IDomEditor, SlateEditor, SlateNode, SlateRange, SlateTransforms} from '@wangeditor-next/editor';

function withVariable<T extends IDomEditor>(editor: T): T {
  const {isInline, isVoid, insertData, normalizeNode, insertNode, deleteBackward, deleteForward, deleteFragment} = editor;
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

    const str = SlateNode.string(node);
    if (str === '') {
      return SlateTransforms.removeNodes(newEditor, {at: path});
    }

    return normalizeNode([node, path]);
  };

  newEditor.deleteBackward = (unit) => {
    deleteBackward(unit);
    const {selection} = newEditor;
    if (selection && SlateRange.isCollapsed(selection)) {
      const variable = DomEditor.getSelectedNodeByType(newEditor, 'variable');
      if (variable) {
        setTimeout(() => {
          const at = DomEditor.findPath(newEditor, variable);
          if (at) {
            SlateTransforms.removeNodes(newEditor, {at});
          }
        });
      }
    }
  };

  newEditor.deleteForward = (unit) => {
    deleteForward(unit);
    const {selection} = newEditor;
    if (selection && SlateRange.isCollapsed(selection)) {
      const variable = DomEditor.getSelectedNodeByType(newEditor, 'variable');
      if (variable) {
        setTimeout(() => {
          const at = DomEditor.findPath(newEditor, variable);
          if (at) {
            SlateTransforms.removeNodes(newEditor, {at});
          }
        });
      }
    }
  };

  // newEditor.deleteForward = (unit) => {
  //   const {selection} = newEditor;
  //   if (selection && SlateRange.isCollapsed(selection)) {
  //     console.log('deleteForward');
  //     console.log(selection.anchor);
  //     const item = SlateNode.get(newEditor, selection.anchor.path);
  //     console.log(item);
  //     const variable = DomEditor.getSelectedNodeByType(newEditor, 'variable');
  //     console.log(variable);
  //     if (variable) {
  //       //console.log(variable);
  //       // const at = DomEditor.findPath(editor, variable);
  //       // SlateTransforms.removeNodes(newEditor, {at});
  //       // console.log(at);
  //     }
  //     deleteForward(unit);
  //   }
  // };

  // newEditor.deleteBackward = (unit) => {
  //   deleteBackward(unit);
  //   const {selection} = newEditor;
  //   if (selection && SlateRange.isCollapsed(selection)) {
  //     const items = SlateEditor.above(editor, {
  //       at: selection,
  //       match: (item) => {
  //         console.log(item);
  //         return SlateEditor.isBlock(editor, item);
  //       },
  //     });
  //     console.log('----');
  //     console.log(items);
  //     //console.log(selection);
  //     // SlateEditor.nodes(newEditor, {
  //     //   match: (node) => {
  //     //     console.log(node);
  //     //     return false;
  //     //   },
  //     // });
  //     // const item = SlateNode.get(newEditor, selection.anchor.path);
  //     // console.log(item);
  //   }
  //   return;
  // };

  // newEditor.deleteForward = (unit) => {
  //   deleteForward(unit);
  //   console.log('deleteForward');
  //   return;
  // };

  return newEditor;
}

export default withVariable;
