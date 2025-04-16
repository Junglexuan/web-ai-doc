import {ClockCircleOutlined, CloudUploadOutlined, HomeOutlined, MenuOutlined, PlusOutlined, StarOutlined, UserOutlined} from '@ant-design/icons';
import {Link} from '@elux/react-web';
import {Boot, DomEditor, IButtonMenu, IDomEditor, IEditorConfig, IToolbarConfig, SlateEditor} from '@wangeditor-next/editor';
import {Editor, Toolbar} from '@wangeditor-next/editor-for-react';
import {Breadcrumb, Button, Space, Spin} from 'antd';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import BlurInput from '@/components/BlurInput';
import DialogPage from '@/components/DialogPage';
import {GetClientRouter} from '@/Global';
import {confirm, debounce, getUrlParam, message, useEvent} from '@/utils/tools';
import DocAPI from '../../api';
import {ItemDetail} from '../../entity';
import AIButton from './AIButton';
import './AIMenu';
import {SaveMgr} from './autoSave';
import {editorConfig, toolbarConfig} from './editorConfig';
import styles from './index.module.less';
import Outline from './Outline';
import type {ISource} from './autoSave';

interface Props {
  itemDetail: ItemDetail;
}

const Component: FC<Props> = ({itemDetail}) => {
  const [editor, setEditor] = useState<IDomEditor>();
  const [docTitle, setDocTitle] = useState(itemDetail.title);
  const [source, setSource] = useState<ISource>({id: itemDetail.id, dsl: itemDetail.articleDsl, html: itemDetail.contents});
  const [autoSave] = useState(() => new SaveMgr());
  const [saving, setSaving] = useState(false);

  const onChange = useEvent((editor: IDomEditor) => {
    //JSON.stringify(editor.children, null, 2)
    const newSource: ISource = {id: itemDetail.id, dsl: JSON.stringify(editor.children), html: editor.getHtml()};
    setSource(newSource);
    autoSave.onChange(newSource);
  });

  const _onChange = useMemo(() => debounce(onChange, 1000), [onChange]);

  const onDocTitleChange = useEvent((title: string) => {
    const _docTitle = docTitle;
    setDocTitle(title);
    if (title === '') {
      setTimeout(() => {
        setDocTitle(_docTitle);
      });
    } else {
      DocAPI.updateDocName(itemDetail.id, title).catch(() => {
        setDocTitle(_docTitle);
      });
    }
  });

  const onKeyUp = useEvent((e: any) => {
    if (e.key === 'Escape') {
      editor?.hidePanelOrModal();
      editor?.focus();
    }
  });

  const onCreated = useEvent((editor: IDomEditor) => {
    setEditor(editor);
    window['editor'] = editor;
    //setTimeout(() => (window['tools'] = DomEditor.getToolbar(editor)));
    editor.on('modalOrPanelShow', (modalOrPanel) => {
      // if (modalOrPanel.type !== 'modal') return;
      // const dom = modalOrPanel.$elem[0];
      // if (dom.style.bottom) {
      //   dom.style.transform = 'translateY(210px)';
      // } else {
      //   dom.style.transform = 'none';
      // }
      // window['aaa'] = dom;
    });
  });

  const onDestroy = useEvent(() => {
    //editor?.emit('destroy', editor);
    editor?.destroy();
  });

  const breadcrumb = useMemo(() => {
    const arr = itemDetail.levelPath.map((item) => ({
      title: (
        <Link to={`/admin/doc/list/maintain?id=${item.id}`} action="relaunch" target="window">
          {item.folderName}
        </Link>
      ),
    }));
    arr.unshift({
      title: (
        <Link to="/admin/doc/list/maintain" action="relaunch" target="window">
          我的文档
        </Link>
      ),
    });
    arr.push({title: <span>{docTitle}</span>});
    return <Breadcrumb items={arr} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docTitle]);

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp);
    autoSave.addListener('loading', setSaving);
    return () => {
      document.removeEventListener('keyup', onKeyUp);
      onDestroy();
      setEditor(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DialogPage size="max" maskClosable={false} showControls={false} showClose={false}>
      <div className={styles.root}>
        <div className="hd">
          <Space size="large">
            <HomeOutlined className="icon-link" onClick={() => GetClientRouter().relaunch({url: `/admin/doc/list/maintain`}, 'window')} />
            <PlusOutlined />
            <MenuOutlined />
            {breadcrumb}
            <StarOutlined />
          </Space>
          <Space>
            <span style={{fontSize: 12, color: '#B9BABB'}}>所有内容都会自动保存到云端</span>
            {saving ? <Spin size="small" /> : <CloudUploadOutlined />}
            <Button type="primary" style={{marginLeft: '10px'}}>
              分享
            </Button>
          </Space>
        </div>
        <div className="cd">
          {editor && <AIButton editor={editor} />}
          {editor && <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" className="tools" />}
        </div>
        <div className="bd" id="_ai_editor_scroller">
          <header>
            <BlurInput
              id="_doc_title"
              data-doc={itemDetail.id}
              size="large"
              key={docTitle}
              value={docTitle}
              className="doc-title"
              onChange={onDocTitleChange}
            />
            <Space className="info">
              <div>
                <UserOutlined />
                <span> 王小兵</span>
              </div>
              <div>
                <ClockCircleOutlined />
                <span> 今天 14:50创建</span>
              </div>
            </Space>
          </header>
          <Editor
            defaultConfig={editorConfig}
            value={source.html}
            onCreated={onCreated}
            onChange={_onChange}
            //style={{minHeight: '500px'}}
            mode="default"
          />
        </div>
        <div className="ft">{editor && <Outline editor={editor} />}</div>
      </div>
    </DialogPage>
  );
};

export default memo(Component);
