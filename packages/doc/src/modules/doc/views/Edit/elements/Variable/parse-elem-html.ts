import {IDomEditor, SlateDescendant, SlateElement, SlateText} from '@wangeditor-next/editor';
import {VariableElement} from './custom-types';

function parseElemHtml(elem: Element, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const kind = elem.getAttribute('data-kind') || '';
  const vid = elem.getAttribute('data-vid') || '';
  const info = decodeURI(elem.getAttribute('data-info') || '');
  const field = decodeURI(elem.getAttribute('data-field') || '') || undefined;
  const source = elem.getAttribute('data-source') || '';

  children = children.filter((child) => {
    if (SlateText.isText(child)) return true;
    if (editor.isInline(child)) return true;
    return false;
  });

  // 无 children ，则用纯文本
  if (children.length === 0) {
    children = [{text: '$'}];
  }

  return {
    type: 'variable',
    vid,
    kind,
    source,
    info,
    field,
    children,
  } as VariableElement;
}

export default {
  selector: 'cite[data-w-e-type="variable"]',
  parseElemHtml,
};
