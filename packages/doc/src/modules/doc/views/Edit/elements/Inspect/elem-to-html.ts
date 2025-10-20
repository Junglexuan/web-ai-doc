import {SlateElement} from '@wangeditor-next/editor';
import {InspectElement} from './custom-types';

function elemToHtml(elem: SlateElement, childrenHtml: string): string {
  const {tag = 'span', raw = ''} = elem as InspectElement;
  return `<${tag} data-w-e-type="inspect" data-inspect="${raw}">${childrenHtml}</${tag}>`;
}

export default {
  type: 'inspect',
  elemToHtml,
};
