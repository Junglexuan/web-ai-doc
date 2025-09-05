=====src/modules/doc/views/Edit/VarLayer/index.tsx

DomEditor.findPath(editor, elem);  找到指定model的路径

SlateTransforms.setNodes(editor, update, {at: path}); 更新节点

=====src/modules/doc/views/Edit/Review/index.tsx

SlateTransforms.setNodes(editor, {source: '', target: '', reason: ''} as any, {
      at: [],
      match: (node) => DomEditor.checkNodeType(node, 'review'),
});

const textNode = DomEditor.getSelectedTextNode(editor); 获取选中的文本节点
if (textNode) {
        const path = DomEditor.findPath(editor, textNode);
        SlateTransforms.select(editor, path);
        SlateTransforms.insertText(editor, item.target || '');
        editor.deselect();
        SlateTransforms.unwrapNodes(editor, {
          at: item.at,
        });
}

editor.getElemsByType('inspect')

const nodes = SlateEditor.nodes(editor, {
      at: [],
      match: (node: any, path) => node.type === 'inspect',
    });