import {SlateElement} from '@wangeditor-next/editor';
import {VariableElement} from './custom-types';

function elemToHtml(elem: SlateElement): string {
  const {kind = '', source = '', info = ''} = elem as VariableElement;
  return `<span data-w-e-type="variable" data-kind="${kind}" data-info="${info}">${source}</span>`;
}

export default {
  type: 'variable',
  elemToHtml,
};
