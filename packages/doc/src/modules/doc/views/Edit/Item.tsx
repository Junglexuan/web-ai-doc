import {ArrowLeftOutlined, EditOutlined, HomeOutlined, RedoOutlined, UndoOutlined} from '@ant-design/icons';
import {Dispatch} from '@elux/react-web';
import {Boot, IButtonMenu, IDomEditor, IEditorConfig, IToolbarConfig} from '@wangeditor-next/editor';
import {Editor, Toolbar} from '@wangeditor-next/editor-for-react';
import {Button, Drawer, Modal, Space} from 'antd';
import {FC, MutableRefObject, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {GetClientRouter, Modules} from '@/Global';
import {confirm, message, useEvent} from '@/utils/tools';
import {ItemDetail} from '../../entity';
import AiMenu from './AiMenu';
import OutlineMenu from './OutlineMenu';
import '@wangeditor-next/editor/dist/css/style.css';

interface Props {
  dispatch: Dispatch;
  itemDetail: ItemDetail;
}

const toolbarConfig: Partial<IToolbarConfig> = {
  insertKeys: {
    index: 32,
    keys: ['_ai', '_outline'],
  },
};
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
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

const Component: FC<Props> = ({itemDetail: _itemDetail, dispatch}) => {
  const [editor, setEditor] = useState<IDomEditor>(); // 存储 editor 实例
  const [html, setHtml] = useState(
    '<p><span style="font-size:16.0pt;color:#000000;white-space:pre-wrap;">000001</span><br/><span style="font-size:16.0pt;color:#000000;white-space:pre-wrap;">机密★1年</span><br/><span style="font-size:16.0pt;color:#000000;white-space:pre-wrap;">特急</span></p>'
  );
  const [itemDetail, updateItemDetail] = useState(_itemDetail);
  const [snapshot, setSnapshot] = useState<any>();
  const hasAnyError = false;
  const refContainer = useRef() as MutableRefObject<HTMLDivElement>;

  const doBack = useEvent(async () => {
    await GetClientRouter().back(1, 'window');
    GetClientRouter().back(0);
  });

  const onBack = useEvent(async () => {
    if (snapshot) {
      confirm(
        '当前文档未保存，您的设计成果将丢失，确认要保存吗？',
        (save) => {
          if (save) {
            if (hasAnyError) {
              message.error('流程存在错误，无法保存！');
              return;
            }
            //onSave().then(doBack);
          } else {
            doBack();
          }
        },
        {okText: '保存', cancelText: '取消'}
      );
    } else {
      doBack();
    }
  });

  const onChange = useEvent((editor: IDomEditor) => {
    setHtml(editor.getHtml());
    //JSON.stringify(editor.children, null, 2)
  });

  const onKeyUp = useEvent((e: any) => {
    if (e.key === 'Escape') {
      editor?.hidePanelOrModal();
      editor?.focus();
    }
  });

  const onDestroy = useEvent(() => {
    //editor?.emit('destroy', editor);
    editor?.destroy();
  });

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keyup', onKeyUp);
      onDestroy();
      setEditor(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="hd">
        <Space>
          <HomeOutlined />
        </Space>

        <Space>
          <HomeOutlined />
        </Space>
      </div>
      <div className="bd">
        <div>
          <Toolbar editor={editor!} defaultConfig={toolbarConfig} mode="default" style={{borderBottom: '1px solid #ccc'}} />
          <Editor
            defaultConfig={editorConfig}
            value={html}
            onCreated={(editor) => {
              setEditor(editor);
              window['editor'] = editor;
            }}
            onChange={onChange}
            mode="default"
            style={{height: '800px'}}
          />
        </div>
        <div style={{borderTop: '1px solid #ccc'}}>{html}</div>
      </div>
      {editor && <OutlineMenu editor={editor} />}
      <AiMenu />
    </>
  );
};

export default memo(Component);
