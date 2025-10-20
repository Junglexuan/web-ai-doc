import {IDomEditor, SlateDescendant, SlateElement, SlateText} from '@wangeditor-next/editor';
import {InspectElement} from './custom-types';

function parseElemHtml(elem: Element, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const tag = elem.tagName.toLowerCase();
  const raw = elem.getAttribute('data-inspect') || '';

  children = children.filter((child) => {
    if (SlateText.isText(child)) return true;
    if (editor.isInline(child)) return true;
    return false;
  });

  // 无 children ，则用纯文本
  if (children.length === 0) {
    children = [{text: ''}];
  }

  return {
    type: 'inspect',
    tag,
    raw,
    children,
  } as InspectElement;
}

export default {
  selector: '*[data-w-e-type="inspect"]',
  parseElemHtml,
};
