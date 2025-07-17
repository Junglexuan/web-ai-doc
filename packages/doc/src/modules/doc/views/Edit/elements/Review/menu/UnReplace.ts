import {DomEditor, IButtonMenu, IDomEditor, SlateTransforms} from '@wangeditor-next/editor';
import {ReviewElement} from '../custom-types';

class UnReplace implements IButtonMenu {
  readonly title = '忽略';
  //readonly iconSvg = UN_LINK_SVG;
  readonly tag = 'button';

  getValue(editor: IDomEditor): string | boolean {
    // 无需获取 val
    return '';
  }

  isActive(editor: IDomEditor): boolean {
    // 无需 active
    return false;
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true;

    const reviewNode = DomEditor.getSelectedNodeByType(editor, 'review') as ReviewElement;
    if (reviewNode == null) {
      // 选区未处于 link node ，则禁用
      return true;
    }
    return false;
  }

  exec(editor: IDomEditor, value: string | boolean): void {
    if (this.isDisabled(editor)) return;

    // 取消链接
    SlateTransforms.setNodes(editor, {source: '', target: '', reason: ''} as any, {
      match: (n) => DomEditor.checkNodeType(n, 'review'),
    });
  }
}

export default UnReplace;
