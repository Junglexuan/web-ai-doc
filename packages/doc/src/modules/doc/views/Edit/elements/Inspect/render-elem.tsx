import {DomEditor, IDomEditor, SlateElement} from '@wangeditor-next/editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import {VNode, datasetModule, h} from 'snabbdom';
import {InspectElement} from './custom-types';

function renderElem(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  const {reason, target, source} = elem as InspectElement;
  //const selected = DomEditor.isNodeSelected(editor, elem);
  const vnode = h(
    'span',
    {
      props: {
        className: 'w-e-inspect' + (!source && !target ? ' ignored' : ''),
        //contentEditable: false,
        // title: reason,
      },
      on: {
        click(event) {
          const dom = event.currentTarget as HTMLElement;
          if (window.getSelection()?.isCollapsed && !editor.getConfig().readOnly) {
            editor.emit('inspect-selected', {elem, dom: {id: dom.id}});
          }
        },
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
  type: 'inspect',
  renderElem,
};
