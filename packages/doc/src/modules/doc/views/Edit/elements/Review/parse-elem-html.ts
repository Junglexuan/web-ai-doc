import {IDomEditor, SlateDescendant, SlateElement, SlateText} from '@wangeditor-next/editor';
import {ReviewElement} from './custom-types';

function parseElemHtml(elem: Element, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const review = decodeURIComponent(elem.getAttribute('data-review') || '');
  const {source = '', target = '', reason = ''} = review ? JSON.parse(review) : {};

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
