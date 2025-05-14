import {SlateElement} from '@wangeditor-next/editor';
import {ReviewElement} from './custom-types';

function elemToHtml(elem: SlateElement, childrenHtml: string): string {
  const {reason = '', source = '', target = ''} = elem as ReviewElement;
  return `<span data-w-e-type="review" data-source="${source}" data-target="${target}" data-reason="${reason}">${childrenHtml}</span>`;
}

export default {
  type: 'review',
  elemToHtml,
};
