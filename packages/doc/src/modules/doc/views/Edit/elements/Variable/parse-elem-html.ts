import {SlateElement} from '@wangeditor-next/editor';
import {VariableElement} from './custom-types';

function parseElemHtml(elem: Element): SlateElement {
  const kind = elem.getAttribute('data-kind') || '';
  const vid = elem.getAttribute('data-vid') || '';
  const info = elem.getAttribute('data-info') || '';
  const source = (elem as any).innerText || '';

  return {
    type: 'variable',
    vid,
    kind,
    source,
    info,
    children: [{text: ''}],
  } as VariableElement;
}

export default {
  selector: 'span[data-w-e-type="variable"]',
  parseElemHtml,
};
