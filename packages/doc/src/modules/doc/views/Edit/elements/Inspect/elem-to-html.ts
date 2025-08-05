import {SlateElement} from '@wangeditor-next/editor';
import {InspectElement} from './custom-types';

function elemToHtml(elem: SlateElement, childrenHtml: string): string {
  const {reason = '', source = '', target = ''} = elem as InspectElement;
  const inspect = encodeURIComponent(JSON.stringify({source, target, reason}));
  return `<span data-w-e-type="inspect" data-inspect="${inspect}">${childrenHtml}</span>`;
}

export default {
  type: 'inspect',
  elemToHtml,
};
