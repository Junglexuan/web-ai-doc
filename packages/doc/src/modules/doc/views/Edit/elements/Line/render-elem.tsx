import {DomEditor, IDomEditor, SlateElement} from '@wangeditor-next/editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import {VNode, h} from 'snabbdom';
import {LineElement} from './custom-types';

function renderElem(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  const {color, weight} = elem as LineElement;
  const selected = DomEditor.isNodeSelected(editor, elem);
  const vnode = h(
    'hr',
    {
      props: {
        className: 'w-e-line',
        contentEditable: false,
      },
      style: {
        height: weight,
        background: color,
      },
    },
    []
  );

  return vnode as any;
}

export default {
  type: 'line',
  renderElem,
};

// const vnode = h(
//   'div',
//   {
//     props: {
//       className: 'w-e-line',
//     },
//   },
//   [
//     h('div', {
//       props: {
//         contentEditable: false,
//       },
//       style: {
//         height: weight,
//         background: color,
//         boxShadow: selected ? '0 0 5px #000a' : 'none',
//       },
//     }),
//   ]
// );
