import {IDomEditor, SlateDescendant, SlateElement, SlateText} from '@wangeditor-next/editor';
import {ReviewElement} from './custom-types';

function parseElemHtml(elem: Element, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const source = elem.getAttribute('data-source') || '';
  const target = elem.getAttribute('data-target') || '';
  const reason = elem.getAttribute('data-reason') || '';

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
    type: 'review',
    reason,
    source,
    target,
    children,
  } as ReviewElement;
}

export default {
  selector: 'span[data-w-e-type="review"]',
  parseElemHtml,
};
