import {Boot, DomEditor, IButtonMenu, IDomEditor, IEditorConfig, IToolbarConfig} from '@wangeditor-next/editor';
import {addClass, removeClass, useEvent} from '@/utils/tools';
export const toolbarConfig: Partial<IToolbarConfig> = {
  //modalAppendToBody: true,
  toolbarKeys: [
    'headerSelect',
    'color',
    'bgColor',
    'bold',
    {
      key: 'group-more-style',
      title: '更多',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path></svg>',
      menuKeys: ['underline', 'through', 'italic', 'sup', 'sub', 'code'],
    },
    '|',
    'fontSize',
    'fontFamily',
    'lineHeight',
    '|',
    {
      key: 'group-justify',
      title: '对齐',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
      menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify'],
    },
    'bulletedList',
    'numberedList',
    '|',
    {
      key: 'group-image',
      title: '图片',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
      menuKeys: ['insertImage', 'uploadImage'],
    },
    'insertLink',
    'insertTable',
    'codeBlock',
    'divider',
    '|',
    'formatPainter',
    'clearStyle',
    '|',
    'undo',
    'redo',
  ],
  // insertKeys: {
  //   index: 32,
  //   keys: ['_ai', '_outline'],
  // },
  // excludeKeys: ['fullScreen'],
};
export const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
  scroll: false,
  onBlur: (e) => {
    addClass(document.getElementById('_ai_button')!, 'disabled');
  },
  onFocus: (e) => {
    removeClass(document.getElementById('_ai_button')!, 'disabled');
  },
  MENU_CONF: {},
  // MENU_CONF: {
  //   fontSize: {
  //     title: 'sss',
  //   },
  // },
  // customPaste: (editor: IDomEditor, event: ClipboardEvent): boolean => {
  //   // event 是 ClipboardEvent 类型，可以拿到粘贴的数据
  //   // 可参考 https://developer.mozilla.org/zh-CN/docs/Web/API/ClipboardEvent

  //   const html = event.clipboardData!.getData('text/html'); // 获取粘贴的 html
  //   const text = event.clipboardData!.getData('text/plain'); // 获取粘贴的纯文本
  //   const rtf = event.clipboardData!.getData('text/rtf'); // 获取 rtf 数据（如从 word wsp 复制粘贴）

  //   console.log(html, text, rtf);

  //   // 同步
  //   editor.insertText('xxx');

  //   // 异步
  //   setTimeout(() => {
  //     editor.insertText('yy');
  //   }, 1000);

  //   // 阻止默认的粘贴行为
  //   event.preventDefault();
  //   return false;

  //   // 继续执行默认的粘贴行为
  //   // return true
  // },
};
