import {SlateElement} from '@wangeditor-next/editor';
import {LineElement} from './custom-types';

function elemToHtml(elem: SlateElement): string {
  const {color = '', weight = ''} = elem as LineElement;
  return `<hr data-w-e-type="line" data-color="${color}" data-weight="${weight}" style="height: ${weight}; background: ${color}" />`;
}

export default {
  type: 'line',
  elemToHtml,
};
