import {IDomEditor} from '@wangeditor-next/editor';
import {createEditor} from '@wangeditor-next/editor';
import {SimpleDispatcher} from '@/utils/tools';
import DocAPI from '../../api';
import AiAPI from './api';

const cloneEditor = createEditor();

export interface ISource {
  id: string;
  dsl: string;
  html: string;
  text: string;
  isTpl?: boolean;
}
export class SaveMgr extends SimpleDispatcher<{loading: boolean}> {
  cycleTime = 2000;
  version = 0;
  toBeSent: ISource | undefined;
  sending: ISource | undefined;
  lasted: string | undefined;
  retry = 0;
  reviewedHtml = '';
  reviewRequest: AbortController | undefined;
  sensitiveRequest: AbortController | undefined;

  constructor() {
    super({loading: {}});
  }

  onChange(source: ISource): void {
    if (this.lasted === undefined) {
      //屏蔽第一次onChange
      this.lasted = source.html;
      return;
    }
    if (this.lasted === source.html) {
      return;
    }
    this.lasted = source.html;
    this.toBeSent = source;
    this.retry = 1;
    if (!this.sending) {
      this.send();
    }
  }
  checkNext = (): void => {
    if (this.sending) {
      this.toBeSent = this.sending;
      this.sending = undefined;
    }
    this.send();
  };
  send(): void {
    if (this.toBeSent) {
      this.sending = this.toBeSent;
      this.toBeSent = undefined;
      this.dispatch('loading', true);
      DocAPI.saveDSL(this.sending.id, this.sending.dsl, this.sending.html, this.sending.text, this.sending.isTpl).then(
        () => {
          this.sending = undefined;
          setTimeout(this.checkNext, this.cycleTime);
        },
        () => {
          if (this.retry) {
            this.retry--;
            setTimeout(this.checkNext, this.cycleTime);
          } else {
            this.lasted = '';
            this.sending = undefined;
          }
        }
      );
    } else {
      this.dispatch('loading', false);
    }
  }
  destroy(): void {
    this.checkNext = () => undefined;
  }
  safeSetHtml(editor: IDomEditor, html: string): void {
    const scroller = document.getElementById('_ai_editor_scroller')!;
    const curScroll = scroller.scrollTop;
    const curSelection = editor.selection;
    editor.deselect();
    editor.setHtml(html);
    //防止setHtml又引发onChange校阅
    setTimeout(() => {
      this.reviewedHtml = editor.getHtml();
      editor.select(curSelection!);
      scroller.scrollTop = curScroll;
    });
  }
  safeSetHtml2(editor: IDomEditor, html: string): void {
    editor.disable();
    cloneEditor.setHtml(html);
    setTimeout(() => {
      const safeHtml = cloneEditor.getHtml();
      const curSelection = editor.selection;
      const scroller = document.getElementById('_ai_editor_scroller')!;
      const curScroll = scroller.scrollTop;
      editor.setHtml(safeHtml);
      setTimeout(() => {
        editor.select(curSelection!);
        scroller.scrollTop = curScroll;
        editor.enable();
      });
    });
  }
  onReview = (editor: IDomEditor, articleId: string): void => {
    const html = editor.getHtml();
    if (html === this.reviewedHtml) {
      console.log('无需。。。review');
      return;
    }
    this.reviewedHtml = html;
    AiAPI.autoReview(
      {articleId, content: html},
      (items) => {
        const originHtml = editor.getHtml();
        let newHtml = originHtml;
        items.forEach((item) => {
          newHtml = replaceReviewItem(newHtml, item);
        });
        if (newHtml !== originHtml) {
          this.safeSetHtml(editor, newHtml);
        }
      },
      this
    );
  };
}

function replaceReviewItem(html: string, item: {long: string; source: string; target: string; type: string; reason: string}): string {
  const {source, target, long, reason} = item;
  const longReg = long.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`((<(?!\\/)[^>]+>)+)([^>]*${longReg}[^<]*)((<(?=\\/)[^>]+>)*)`, 'g'), (code, start, tag, text, end) => {
    const sourceReg = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    start = start
      .replace(/<(?!span|s|u|em|strong|sup|sub)[^>]+>/g, '')
      .replace(/<ul[^>]*>/, '')
      .replace(/<span data-w-e-type="review"/g, '<span');
    end = end.replace(/<\/(?!span|s|u|em|strong|sup|sub)[^>]+>/g, '').replace(/<\/ul>/, '');
    // console.log(start, text, end);
    const reviewData = encodeURIComponent(JSON.stringify({source, target, reason}));
    return code.replace(
      new RegExp(sourceReg, 'g'),
      `${end}<span data-w-e-type="review" data-review="${reviewData}">${start}${source}${end}</span>${start}`
    );
  });
}
