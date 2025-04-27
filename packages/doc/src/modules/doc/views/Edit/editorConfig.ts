import {IEditorConfig, IToolbarConfig} from '@wangeditor-next/editor';
import {replaceBaseUrl} from '@/utils/request';
export const toolbarConfig: Partial<IToolbarConfig> = {
  //modalAppendToBody: true,
  toolbarKeys: [
    'headerSelect',
    'color',
    'bgColor',
    {
      key: 'group-more-style',
      title: '更多',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M707.872 484.64A254.88 254.88 0 0 0 768 320c0-141.152-114.848-256-256-256H192v896h384c141.152 0 256-114.848 256-256a256.096 256.096 0 0 0-124.128-219.36zM384 192h101.504c55.968 0 101.504 57.408 101.504 128s-45.536 128-101.504 128H384V192z m159.008 640H384v-256h159.008c58.464 0 106.016 57.408 106.016 128s-47.552 128-106.016 128z"></path></svg>',
      menuKeys: ['bold', 'underline', 'through', 'italic', 'sup', 'sub', 'code'],
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
    {
      key: 'group-indent',
      title: '缩进',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
      menuKeys: ['indent', 'delIndent'],
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
  // onBlur: (e) => {
  //   addClass(document.getElementById('_ai_button')!, 'disabled');
  // },
  // onFocus: (e) => {
  //   removeClass(document.getElementById('_ai_button')!, 'disabled');
  // },
  hoverbarKeys: {
    text: {
      menuKeys: [
        'ai',
        '|',
        'color',
        'bgColor',
        '|',
        'bold',
        'underline',
        'through',
        'italic',
        'sup',
        'sub',
        'code',
        '|',
        'formatPainter',
        'clearStyle',
      ],
    },
  },
  MENU_CONF: {
    fontFamily: {
      fontFamilyList: [
        {name: '黑体', value: 'SimHei'},
        {name: '楷体', value: '楷体, 楷体-简, 楷体-繁, KaiTi, STKaiti, 华文楷体'},
        {name: '宋体', value: '宋体, 宋体-简, 宋体-繁, 华文宋体, simsun, SimSun, STSong'},
        {name: '仿宋', value: '仿宋, FangSong, STFangsong'},
        '微软雅黑',
        'Arial',
        'Arial Black',
        'Tahoma',
        'Verdana',
        {name: 'Times Roman', value: 'Times New Roman'},
        {name: 'Comic Sans', value: 'Comic Sans MS'},
        'Courier New',
      ],
    },
    uploadImage: {
      base64LimitSize: 2 * 1024,
      fieldName: 'file',
      server: replaceBaseUrl('/dream/pen/upload/img'),
      timeout: 5 * 1000,
      maxFileSize: 10 * 1024 * 1024, // 10M
      // 将 meta 拼接到 url 参数中，默认 false
      metaWithUrl: false,
      onSuccess(file: any, res: any) {
        //console.log(`${file.name} 上传成功`, res);
      },
      onFailed(file: any, res: any) {
        //console.log(`${file.name} 上传失败`, res);
      },
      onError(file: any, err: any, res: any) {
        //console.log(`${file.name} 上传出错`, err, res);
      },
    },
  },
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
// if ('queryLocalFonts' in window) {
//   (window as any).queryLocalFonts().then((items: any) => {
//     console.log(items);
//   });
// }
