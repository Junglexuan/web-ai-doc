import {IModuleConf} from '@wangeditor-next/editor';
import elemsToHtml from './elem-to-html';
import {colourLineMenuConf, insertLineMenuConf, weightLineMenuConf} from './menu/index';
import parseElemsHtml from './parse-elem-html';
import withLine from './plugin';
import renderElems from './render-elem';

export default {
  renderElems: [renderElems],
  elemsToHtml: [elemsToHtml],
  parseElemsHtml: [parseElemsHtml],
  menus: [insertLineMenuConf, colourLineMenuConf, weightLineMenuConf],
  editorPlugin: withLine,
} as Partial<IModuleConf>;
