import {SlateElement} from '@wangeditor-next/editor';
import {ReviewElement} from './custom-types';

function elemToHtml(elem: SlateElement, childrenHtml: string): string {
  const {reason = '', source = '', target = ''} = elem as ReviewElement;
  const review = encodeURIComponent(JSON.stringify({source, target, reason}));
  return `<span data-w-e-type="review" data-review="${review}">${childrenHtml}</span>`;
}

export default {
  type: 'review',
  elemToHtml,
};
