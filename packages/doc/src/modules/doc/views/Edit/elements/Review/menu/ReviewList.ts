import {DomEditor, IButtonMenu, IDomEditor, SlateTransforms} from '@wangeditor-next/editor';

class UnReplace implements IButtonMenu {
  readonly title = '查看全部';
  //readonly iconSvg = `<svg viewBox="0 0 1024 1024" focusable="false" data-icon="bars" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM104 228a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0z"></path></svg>`;
  readonly tag = 'button';

  getValue(editor: IDomEditor): string | boolean {
    return '';
  }

  isActive(editor: IDomEditor): boolean {
    return false;
  }

  isDisabled(editor: IDomEditor): boolean {
    return false;
  }

  exec(editor: IDomEditor, value: string | boolean): void {
    const btn = document.getElementById('_ai_review_btn');
    if (btn) {
      btn.click();
    }
    return;
  }
}

export default UnReplace;
