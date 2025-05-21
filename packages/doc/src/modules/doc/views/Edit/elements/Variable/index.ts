import {IModuleConf} from '@wangeditor-next/editor';
import elemsToHtml from './elem-to-html';
import parseElemsHtml from './parse-elem-html';
import withVariable from './plugin';
import renderElems from './render-elem';

export default {
  renderElems: [renderElems],
  elemsToHtml: [elemsToHtml],
  parseElemsHtml: [parseElemsHtml],
  editorPlugin: withVariable,
} as Partial<IModuleConf>;
