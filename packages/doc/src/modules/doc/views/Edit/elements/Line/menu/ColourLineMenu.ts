import {DomEditor, SlateEditor as Editor, IDomEditor, IDropPanelMenu, SlateTransforms} from '@wangeditor-next/editor';
import {LineElement} from '../custom-types';

class ColourLineMenu implements IDropPanelMenu {
  readonly title = '颜色';
  readonly iconSvg =
    '<svg viewBox="0 0 1024 1024"><path d="M510.030769 315.076923l84.676923 196.923077h-177.230769l76.8-196.923077h15.753846zM945.230769 157.538462v708.923076c0 43.323077-35.446154 78.769231-78.769231 78.769231H157.538462c-43.323077 0-78.769231-35.446154-78.769231-78.769231V157.538462c0-43.323077 35.446154-78.769231 78.769231-78.769231h708.923076c43.323077 0 78.769231 35.446154 78.769231 78.769231z m-108.307692 643.938461L600.615385 216.615385c-5.907692-11.815385-15.753846-19.692308-29.538462-19.692308h-139.815385c-11.815385 0-23.630769 7.876923-27.56923 19.692308l-216.615385 584.861538c-3.938462 11.815385 3.938462 25.6 17.723077 25.6h80.738462c11.815385 0 23.630769-9.846154 27.56923-21.661538l63.015385-175.261539h263.876923l68.923077 175.261539c3.938462 11.815385 15.753846 21.661538 27.569231 21.661538h80.738461c13.784615 0 23.630769-13.784615 19.692308-25.6z"></path></svg>';
  readonly tag = 'button';
  readonly showDropPanel = true; // 点击 button 时显示 dropPanel
  private $content: any = null;

  getValue(editor: IDomEditor): string | boolean {
    // const [match] = Editor.nodes(editor, {
    //   match: (node) => {
    //     const type = DomEditor.getNodeType(node);
    //     if (type === 'line') return true;
    //     return false;
    //   },
    //   universal: true,
    // });
    // console.log(match);
    return '';
  }

  isActive(editor: IDomEditor): boolean {
    return false;
    // const color = this.getValue(editor);
    // return !!color;
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true;
    return false;

    // // 命中，则禁用
    // if (match) return true;
    // return false;
  }

  getPanelContentElem(editor: IDomEditor): HTMLElement {
    if (this.$content == null) {
      // 第一次渲染
      const $content = document.createElement('ul');
      $content.setAttribute('class', 'w-e-panel-content-color');

      // 绑定事件（只在第一次绑定，不要重复绑定）
      $content.addEventListener('click', (e) => {
        const target = e.target as HTMLDivElement;
        if (target == null) return;
        e.preventDefault();

        const {selection} = editor;
        if (selection == null) return;
        const val = target.getAttribute('data-value');
        if (val) {
          const props = {color: val} as any;
          SlateTransforms.setNodes(editor, props, {
            match: (node: any) => {
              return node.type === 'line';
            },
          });
        }
      });

      this.$content = $content;
    }
    const $content = this.$content as HTMLElement;
    if ($content == null) return document.createElement('ul');

    // 当前选中文本的颜色之
    const lineNode = (DomEditor.getSelectedNodeByType(editor, 'line') || {}) as LineElement;

    // 获取菜单配置
    const colorConf = editor.getMenuConfig('color');
    const {colors = []} = colorConf;
    // 根据菜单配置生成 panel content
    const html: string[] = [];
    colors.forEach((color: string) => {
      const li = `<li class="${
        lineNode.color === color ? 'active' : ''
      }" data-value="${color}"><div style="background: ${color}" class="color-block" data-value="${color}"></div></li>`;
      html.push(li);
    });
    $content.innerHTML = html.join('');
    return $content;
  }
  exec(editor: IDomEditor, value: string | boolean): void {
    // 点击菜单时，弹出 droPanel 之前，不需要执行其他代码
    // 此处空着即可
  }
}

export default ColourLineMenu;
