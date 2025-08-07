import {IDomEditor, SlateDescendant, SlateElement, SlateText} from '@wangeditor-next/editor';
import {InspectElement} from './custom-types';

function parseElemHtml(elem: Element, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const inspect = decodeURIComponent(elem.getAttribute('data-inspect') || '');
  const {source = '', target = '', reason = '', level = ''} = inspect ? JSON.parse(inspect) : {};

  children = children.filter((child) => {
    if (SlateText.isText(child)) return true;
    if (editor.isInline(child)) return true;
    return false;
  });

  // 无 children ，则用纯文本
  if (children.length === 0) {
    children = [{text: source}];
  }

  return {
    type: 'inspect',
    reason,
    source,
    target,
    level,
    children,
  } as InspectElement;
}

export default {
  selector: 'span[data-w-e-type="inspect"]',
  parseElemHtml,
};
