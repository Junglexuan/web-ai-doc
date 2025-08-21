import {IButtonMenu, IDomEditor, SlateTransforms} from '@wangeditor-next/editor';
import {LineElement} from '../custom-types';

class InsertLine implements IButtonMenu {
  readonly title = '分隔线';
  readonly iconSvg = `<svg viewBox="0 0 1092 1024"><path d="M0 51.2m51.2 0l989.866667 0q51.2 0 51.2 51.2l0 0q0 51.2-51.2 51.2l-989.866667 0q-51.2 0-51.2-51.2l0 0q0-51.2 51.2-51.2Z"></path><path d="M0 460.8m51.2 0l170.666667 0q51.2 0 51.2 51.2l0 0q0 51.2-51.2 51.2l-170.666667 0q-51.2 0-51.2-51.2l0 0q0-51.2 51.2-51.2Z"></path><path d="M819.2 460.8m51.2 0l170.666667 0q51.2 0 51.2 51.2l0 0q0 51.2-51.2 51.2l-170.666667 0q-51.2 0-51.2-51.2l0 0q0-51.2 51.2-51.2Z"></path><path d="M409.6 460.8m51.2 0l170.666667 0q51.2 0 51.2 51.2l0 0q0 51.2-51.2 51.2l-170.666667 0q-51.2 0-51.2-51.2l0 0q0-51.2 51.2-51.2Z"></path><path d="M0 870.4m51.2 0l989.866667 0q51.2 0 51.2 51.2l0 0q0 51.2-51.2 51.2l-989.866667 0q-51.2 0-51.2-51.2l0 0q0-51.2 51.2-51.2Z"></path></svg>`;
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
    const node: LineElement = {
      type: 'line',
      color: 'rgb(255, 77, 79)',
      weight: '2px',
      children: [{text: ''}],
    };
    SlateTransforms.insertNodes(editor, node, {mode: 'highest'});
  }
}

export default InsertLine;
