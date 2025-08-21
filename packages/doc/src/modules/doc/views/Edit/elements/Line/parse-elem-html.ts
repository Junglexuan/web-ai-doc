import {IDomEditor, SlateDescendant, SlateElement} from '@wangeditor-next/editor';
import {LineElement} from './custom-types';

function parseElemHtml(elem: Element): SlateElement {
  const color = elem.getAttribute('data-color') || 'rgb(255, 77, 79)';
  const weight = elem.getAttribute('data-weight') || '1px';

  return {
    type: 'line',
    color,
    weight,
    children: [{text: ''}], // void node 有一个空白 text
  } as LineElement;
}

export default {
  selector: 'hr[data-w-e-type="line"]',
  parseElemHtml,
};
