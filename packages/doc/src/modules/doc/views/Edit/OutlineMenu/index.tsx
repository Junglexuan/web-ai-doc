import {Boot, IButtonMenu, IDomEditor, SlateNode} from '@wangeditor-next/editor';
import {FC, memo, useEffect} from 'react';
import {addClass, hasClass, removeClass, useEvent} from '@/utils/tools';
import styles from './index.module.less';

class OutlineMenu implements IButtonMenu {
  public title: string;
  public tag: string;

  constructor() {
    this.title = '大纲';
    // this.iconSvg = '<svg >...</svg>'
    this.tag = 'button';
  }
  isActive(editor: IDomEditor): boolean {
    return false;
  }
  getValue(editor: IDomEditor): string | boolean {
    return '';
  }
  isDisabled(editor: IDomEditor): boolean {
    return false;
  }
  // 点击菜单时触发的函数
  exec(editor: IDomEditor, value: string | boolean) {
    const div = document.getElementById('_outline_modal');
    if (div) {
      if (hasClass(div, 'on')) {
        removeClass(div, 'on');
      } else {
        addClass(div, 'on');
      }
    }
  }
}

const menu1Conf = {
  key: '_outline',
  factory() {
    return new OutlineMenu();
  },
};
Boot.registerMenu(menu1Conf);

interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const onClick = useEvent((e: any) => {
    if (e.target.tagName !== 'LI') return;
    e.preventDefault();
    const id = e.target.id;
    editor.scrollToElem(id);
  });
  const onClose = useEvent((e: any) => {
    const div = document.getElementById('_outline_modal');
    if (div) {
      if (hasClass(div, 'on')) {
        removeClass(div, 'on');
      } else {
        addClass(div, 'on');
      }
    }
  });
  useEffect(() => {
    editor.on('change', () => {
      const headers = editor.getElemsByTypePrefix('header');
      const headerContainer = document.getElementById('_outline_modal_content')!;
      headerContainer.innerHTML =
        '<ul>' +
        headers
          .map((header: any) => {
            const text = SlateNode.string(header);
            const {id, type} = header;
            return `<li id="${id}" type="${type}">${text}</li>`;
          })
          .join('') +
        '</ul>';
    });
  }, [editor]);

  return (
    <div className={styles.root} id="_outline_modal" onClick={onClick}>
      <span className="close" onClick={onClose}>
        <svg viewBox="0 0 1024 1024">
          <path d="M1024 896.1024l-128 128L512 640 128 1024 0 896 384 512 0 128 128 0 512 384 896.1024 0l128 128L640 512z"></path>
        </svg>
      </span>
      <div id="_outline_modal_content"></div>
    </div>
  );
};

export default memo(Component);
