import {DomEditor, IDomEditor, SlateElement} from '@wangeditor-next/editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import {VNode, datasetModule, h} from 'snabbdom';
import {ReviewElement} from './custom-types';

function renderElem(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  //const {reason, target, source} = elem as ReviewElement;
  //const selected = DomEditor.isNodeSelected(editor, elem);
  const vnode = h(
    'span',
    {
      props: {
        className: 'w-e-review',
        contentEditable: false,
        // title: reason,
      },
      // style: {
      //   marginLeft: '3px',
      //   marginRight: '3px',
      //   backgroundColor: 'var(--w-e-textarea-slight-bg-color)',
      //   border: selected // 选中/不选中，样式不一样
      //     ? '2px solid var(--w-e-textarea-selected-border-color)' // wangEditor 提供了 css var https://www.wangeditor.com/v5/theme.html
      //     : '2px solid transparent',
      //   borderRadius: '3px',
      //   padding: '0 3px',
      // },
    },
    children
  );

  return vnode as any;
}

export default {
  type: 'review',
  renderElem,
};
