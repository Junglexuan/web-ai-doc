import {createEditor} from '@wangeditor-next/editor';
import {SimpleDispatcher} from '@/utils/tools';
import DocAPI from '../../api';
import {DocType} from '../../entity';

//const cloneEditor = createEditor();

export interface ISource {
  id: string;
  dsl: string;
  html: string;
  text: string;
  docType: DocType;
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
      DocAPI.saveDSL(this.sending.id, this.sending.dsl, this.sending.html, this.sending.text, this.sending.docType).then(
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
  // safeSetHtml2(editor: IDomEditor, html: string): void {
  //   editor.disable();
  //   cloneEditor.setHtml(html);
  //   setTimeout(() => {
  //     const safeHtml = cloneEditor.getHtml();
  //     const curSelection = editor.selection;
  //     const scroller = document.getElementById('_ai_editor_scroller')!;
  //     const curScroll = scroller.scrollTop;
  //     editor.setHtml(safeHtml);
  //     setTimeout(() => {
  //       editor.select(curSelection!);
  //       scroller.scrollTop = curScroll;
  //       editor.enable();
  //     });
  //   });
  // }
}
