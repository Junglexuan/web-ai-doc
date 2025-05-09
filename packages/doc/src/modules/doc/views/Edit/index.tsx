import {
  ClockCircleOutlined,
  CloudUploadOutlined,
  HomeOutlined,
  MenuOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {Link, setLoading as setGlobalLoading} from '@elux/react-web';
import {IDomEditor} from '@wangeditor-next/editor';
import {Editor, Toolbar} from '@wangeditor-next/editor-for-react';
import {Breadcrumb, Button, Dropdown, Space, Spin} from 'antd';
import dayjs from 'dayjs';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import BlurInput from '@/components/BlurInput';
import DialogPage from '@/components/DialogPage';
import {GetClientRouter} from '@/Global';
import {downloadFile, replaceBaseUrl} from '@/utils/request';
import {confirm, debounce, message, toNativeUrl, useEvent} from '@/utils/tools';
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
  const [collect, setCollect] = useState(itemDetail.collect);
  const [source, setSource] = useState<ISource>({id: itemDetail.id, dsl: itemDetail.articleDsl, html: itemDetail.contents, text: ''});
  const [autoSave] = useState(() => new SaveMgr());
  const [saving, setSaving] = useState(false);

  const onSave = useEvent((editor: IDomEditor) => {
    //JSON.stringify(editor.children, null, 2)
    const newSource: ISource = {id: itemDetail.id, dsl: JSON.stringify(editor.children), html: editor.getHtml(), text: editor.getText()};
    setSource(newSource);
    autoSave.onChange(newSource);
  });

  const onChange = useMemo(() => debounce(onSave, 1000), [onSave]);

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
    } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      editor && onChange(editor);
    }
  });

  const onCreatDoc = useEvent(() => {
    DocAPI.createDoc({folder: itemDetail.folder, title: '', contents: ''})
      .then(({id}) => {
        window.open(toNativeUrl(`/admin/doc/item/edit/${id}?__c=_dialog`));
      })
      .catch((e) => {
        message.error(e + '');
      });
  });

  const onCreated = useEvent((editor: IDomEditor) => {
    setEditor(editor);
    window['editor'] = editor;
    //setTimeout(() => (window['tools'] = DomEditor.getToolbar(editor)));
    editor.on('modalOrPanelShow', (modalOrPanel) => {
      if (modalOrPanel.type !== 'modal') return;
      const dialog: HTMLElement = modalOrPanel.$elem[0];
      const dialogRect = dialog.getBoundingClientRect();
      const scroller = editor.getEditableContainer();
      const scrollerRect = scroller.getBoundingClientRect();
      if (dialogRect.x < scrollerRect.x) {
        dialog.style.transform = `translateX(${scrollerRect.x - dialogRect.x + 10}px)`;
      }
      //const {$elem} = modalOrPanel;

      //
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
    autoSave.destroy();
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
    arr.push({
      title: (
        <>
          <span>{docTitle}</span>
          {!collect ? (
            <StarOutlined className="anticon-star-outline" onClick={() => DocAPI.collectItem(itemDetail.id, 'doc', true).then(() => setCollect(1))} />
          ) : (
            <StarFilled onClick={() => DocAPI.collectItem(itemDetail.id, 'doc', false).then(() => setCollect(0))} />
          )}
        </>
      ),
    });
    return <Breadcrumb items={arr} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docTitle, collect]);

  useEffect(() => {
    document.addEventListener('keydown', onKeyUp);
    autoSave.addListener('loading', setSaving);
    return () => {
      document.removeEventListener('keydown', onKeyUp);
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
            <HomeOutlined className="icon-link" onClick={() => GetClientRouter().relaunch({url: `/admin/home`}, 'window')} />
            <PlusOutlined className="icon-link" onClick={onCreatDoc} title="新建文档" />
            <Dropdown
              menu={{
                onClick: ({key}: {key: string}) => {
                  if (key === '下载Word') {
                    setGlobalLoading(
                      downloadFile(replaceBaseUrl(`/dream/pen/article/down?id=${itemDetail.id}&type=word`), itemDetail.title),
                      GetClientRouter().getActivePage().store
                    );
                  } else if (key === '下载PDF') {
                    setGlobalLoading(
                      downloadFile(replaceBaseUrl(`/dream/pen/article/down?id=${itemDetail.id}&type=pdf`), itemDetail.title),
                      GetClientRouter().getActivePage().store
                    );
                  }
                },
                items: [
                  {
                    key: '下载Word',
                    label: '下载Word',
                  },
                  {
                    key: '下载PDF',
                    label: '下载PDF',
                  },
                ],
              }}
            >
              <MenuOutlined className="icon-link" />
            </Dropdown>
            {breadcrumb}
          </Space>
          <Space>
            <span style={{fontSize: 12, color: '#B9BABB'}}>所有内容都会自动保存到云端</span>
            {saving ? (
              <span id="_ai_saving">
                <Spin size="small" />
              </span>
            ) : (
              <CloudUploadOutlined style={{color: '#B9BABB'}} />
            )}
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
                <span> {itemDetail.createUserName}</span>
              </div>
              <div>
                <ClockCircleOutlined />
                <span> {itemDetail.createDate ? dayjs(itemDetail.createDate).format('YYYY-MM-DD HH:mm:ss') : ''} 创建</span>
              </div>
            </Space>
          </header>
          <Editor
            defaultConfig={editorConfig}
            value={source.html}
            onCreated={onCreated}
            onChange={onChange}
            //style={{minHeight: '500px'}}
            mode="default"
          />
        </div>
        <div className="ft">
          {editor && <Outline editor={editor} />}
          <span className="count">{source.text ? source.text.replace(/\n|\r/gm, '').length : ''}个字</span>
        </div>
      </div>
    </DialogPage>
  );
};

export default memo(Component);
