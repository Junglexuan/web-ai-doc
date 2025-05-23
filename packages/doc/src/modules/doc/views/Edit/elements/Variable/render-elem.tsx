import {DomEditor, IDomEditor, SlateElement} from '@wangeditor-next/editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import {VNode, datasetModule, h} from 'snabbdom';
import {VariableElement} from './custom-types';

function renderElem(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  const {info} = elem as VariableElement;
  //const selected = DomEditor.isNodeSelected(editor, elem);
  const [title, ...labels] = info.split('|');
  const vnode = h(
    'span',
    {
      props: {
        className: 'w-e-variable',
        contentEditable: false,
        title: title,
        lang: labels.join(''),
      },
      on: {
        click(event) {
          const el = event.target as HTMLElement;
          editor.emit('variable-selected', {elem, pos: el.getBoundingClientRect()});
        },
      },
      //style: {display: 'inline-block', marginLeft: '3px'},
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
    //[h('cite', {}, [title]), h('span', {}, [labels.join('')]), ...children!]
  );

  return vnode as any;
}

export default {
  type: 'variable',
  renderElem,
};
