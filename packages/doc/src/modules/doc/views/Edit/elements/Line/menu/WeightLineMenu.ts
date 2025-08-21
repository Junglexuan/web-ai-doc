import {DomEditor, IDomEditor, ISelectMenu, SlateTransforms} from '@wangeditor-next/editor';
import {LineElement} from '../custom-types';

class WeightLineMenu implements ISelectMenu {
  readonly title = '线宽';
  readonly tag = 'select';
  readonly width = 60;

  getOptions(editor: IDomEditor): {value: string; text: string}[] {
    const options = [
      {value: '1px', text: '1px'},
      {value: '2px', text: '2px'},
      {value: '3px', text: '3px'},
      {value: '4px', text: '4px'},
      {value: '5px', text: '5px'},
      {value: '6px', text: '6px'},
      {value: '8px', text: '8px'},
      {value: '10px', text: '10px'},
      {value: '15px', text: '15px'},
    ];
    return options;
  }
  isActive(editor: IDomEditor): boolean {
    return false;
  }

  getValue(editor: IDomEditor): string | boolean {
    const lineNode = DomEditor.getSelectedNodeByType(editor, 'line') as LineElement;
    return lineNode ? lineNode.weight : '';
  }

  isDisabled(editor: IDomEditor): boolean {
    return false;
  }

  // 点击菜单时触发的函数
  exec(editor: IDomEditor, value: string | boolean): void {
    console.log(value);
    const props = {weight: value} as any;
    SlateTransforms.setNodes(editor, props, {
      match: (node: any) => {
        return node.type === 'line';
      },
    });
    // TS 语法
    // exec(editor, value) {                              // JS 语法
    // Select menu ，这个函数不用写，空着即可
  }
}

export default WeightLineMenu;
