import {IModuleConf} from '@wangeditor-next/editor';
import elemsToHtml from './elem-to-html';
import {applyReplaceMenuConf, reviewListMenuConf, reviewMenuConf, unReplaceMenuConf} from './menu/index';
import parseElemsHtml from './parse-elem-html';
import withReview from './plugin';
import renderElems from './render-elem';

export default {
  renderElems: [renderElems],
  elemsToHtml: [elemsToHtml],
  parseElemsHtml: [parseElemsHtml],
  menus: [applyReplaceMenuConf, unReplaceMenuConf, reviewListMenuConf, reviewMenuConf],
  editorPlugin: withReview,
} as Partial<IModuleConf>;
