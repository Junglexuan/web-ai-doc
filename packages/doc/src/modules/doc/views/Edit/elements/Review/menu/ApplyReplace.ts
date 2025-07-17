import {DomEditor, IButtonMenu, IDomEditor, SlateNode, SlateTransforms} from '@wangeditor-next/editor';
import {ReviewElement} from '../custom-types';
class ApplyReplace implements IButtonMenu {
  title = '替换';
  //readonly iconSvg = UN_LINK_SVG;
  readonly tag = 'button';

  getValue(editor: IDomEditor): string | boolean {
    // 无需获取 val
    return '';
  }

  isActive(editor: IDomEditor): boolean {
    const reviewNode = DomEditor.getSelectedNodeByType(editor, 'review') as ReviewElement;
    if (reviewNode) {
      const {target, source, reason} = reviewNode as any;
      const btn = document.querySelector('[data-menu-key=applyReplace]') as HTMLElement;
      if (btn) {
        const parent = btn.parentElement!.parentElement!;
        let div = parent.children[0] as HTMLDivElement;
        if (div.className !== 'w-e-review-info') {
          div = document.createElement('div');
          div.className = 'w-e-review-info';
          parent.insertBefore(div, parent.children[0]);
        }
        div.innerHTML = `<div><div class="tips">你可能想要输入：</div><div class="target">${target}</div><div class="reason">${reason}</div></div>`;
      }
    }
    return false;
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true;

    const reviewNode = DomEditor.getSelectedNodeByType(editor, 'review');
    if (reviewNode == null) {
      // 选区未处于 link node ，则禁用
      return true;
    }
    return false;
  }

  exec(editor: IDomEditor, value: string | boolean, aaa?: any): void {
    if (this.isDisabled(editor)) return;

    const reviewNode = DomEditor.getSelectedNodeByType(editor, 'review');
    const textNode = DomEditor.getSelectedTextNode(editor);
    if (reviewNode && textNode) {
      const {target} = reviewNode as any;
      const path = DomEditor.findPath(editor, textNode);
      SlateTransforms.select(editor, path);
      SlateTransforms.insertText(editor, target || '');
      SlateTransforms.unwrapNodes(editor, {
        match: (n) => DomEditor.checkNodeType(n, 'review'),
      });
      // SlateTransforms.setNodes(editor, {text: '222'} as any, {
      //   match: (n: any) => {
      //     console.log(n.text, textNode.text);
      //     return n.text === textNode.text;
      //   },
      // });
      //console.log(target);
      //SlateTransforms.delete(editor);
      //SlateTransforms.insertText(editor, '111');
    }
  }
}

export default ApplyReplace;
