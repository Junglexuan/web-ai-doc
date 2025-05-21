import {SimpleDispatcher} from '@/utils/tools';
import DocAPI from '../../api';

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
          setTimeout(this.checkNext, this.cycleTime);
        }
      );
    } else {
      this.dispatch('loading', false);
    }
  }
  destroy(): void {
    this.checkNext = () => undefined;
  }
}
