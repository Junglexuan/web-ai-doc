import {SlateElement} from '@wangeditor-next/editor';
import {VariableElement} from './custom-types';

function elemToHtml(elem: SlateElement, childrenHtml: string): string {
  const {kind = '', source = '', info = '', field = ''} = elem as VariableElement;
  return `<cite data-w-e-type="variable"  data-kind="${kind}" data-field="${encodeURI(field)}" data-info="${encodeURI(
    info
  )}" data-source="${source}">${childrenHtml}</cite>`;
}

export default {
  type: 'variable',
  elemToHtml,
};
