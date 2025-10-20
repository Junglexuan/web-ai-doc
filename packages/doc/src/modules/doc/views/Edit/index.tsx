import {
  ArrowLeftOutlined,
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
import {Breadcrumb, Dropdown, Space, Spin} from 'antd';
import dayjs from 'dayjs';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import BlurInput from '@/components/BlurInput';
import DialogPage from '@/components/DialogPage';
import {GetClientRouter} from '@/Global';
import {downloadFile, replaceBaseUrl} from '@/utils/request';
import {debounce, openArticle, useEvent} from '@/utils/tools';
import DocAPI from '../../api';
import {ItemDetail} from '../../entity';
import AIButton from './AIButton';
import './AIMenu';
import AITpl from './AITpl';
import AiAPI from './api';
import {SaveMgr} from './autoSave';
import Chart from './Chart';
import ContButton from './ContButton';
import {editorConfig, getToolbarConfig} from './editorConfig';
import styles from './index.module.less';
import Inspect from './Inspect';
import Outline from './Outline';
import Review from './Review';
import ReviewButton from './ReviewButton';
import TplPreview from './TplPreview';
import {replaceReviewItem, toSafeHtml} from './utils';
import VarButton from './VarButton';
import type {ISource} from './autoSave';
import type {MenuProps} from 'antd';

const SizeEnum = {
  常规: '750px',
  超宽: '70%',
  全宽: '92%',
};
interface Props {
  itemDetail: ItemDetail;
}

const Component: FC<Props> = ({itemDetail}) => {
  const defaultConfig = useMemo(() => {
    if (itemDetail.readonly) {
      return {...editorConfig, readOnly: true};
    } else {
      return editorConfig;
    }
  }, [itemDetail.readonly]);
  const [toolbarConfig] = useState(getToolbarConfig(itemDetail));
  const [editor, setEditor] = useState<IDomEditor>();
  const [docTitle, setDocTitle] = useState(itemDetail.title);
  const [collect, setCollect] = useState(itemDetail.collect);
  const [source, setSource] = useState<ISource>({
    id: itemDetail.id,
    dsl: itemDetail.articleDsl,
    html: itemDetail.contents,
    text: '',
    docType: itemDetail.docType,
  });
  const [autoSave] = useState(() => new SaveMgr());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState<'create' | ''>('');
  const [size, setSize] = useState<'常规' | '全宽' | '超宽'>(itemDetail.size || '常规');
  const [reviewing, setReviewing] = useState<[AbortController, AbortController]>();
  const [inspecting, setInspecting] = useState<AbortController>();
  const [layout, setLayout] = useState(0);

  const _onSave = useEvent((editor: IDomEditor) => {
    //JSON.stringify(editor.children, null, 2)
    const newSource: ISource = {
      id: itemDetail.id,
      dsl: JSON.stringify(editor.children),
      html: editor.getHtml(),
      text: editor.getText(),
      docType: itemDetail.docType,
    };
    setSource(newSource);
    autoSave.onChange(newSource);
  });

  const onSave = useMemo(() => debounce(_onSave, 1000), [_onSave]);

  const onChange = useEvent((editor: IDomEditor) => {
    onSave(editor);
  });

  const onReview = useEvent(() => {
    const btn = document.getElementById('_ai_reviewList_btn');
    if (btn) {
      btn.click();
    }
    const reqs = AiAPI.autoReview(
      {articleId: itemDetail.id, content: editor!.getHtml()},
      (items) => {
        const originHtml = editor!.getHtml();
        let newHtml = originHtml;
        items.forEach((item) => {
          newHtml = replaceReviewItem(newHtml, item);
        });
        if (newHtml !== originHtml) {
          editor!.setHtml(newHtml);
        }
      },
      () => {
        setReviewing(undefined);
      },
      () => {
        setReviewing(undefined);
      }
    );
    setReviewing(reqs);
  });

  const onCancelReview = useEvent(() => {
    const reqs = reviewing;
    setReviewing(undefined);
    if (reqs) {
      reqs[0].abort();
      reqs[1].abort();
    }
  });

  const onInspect = useEvent(({type, stand}: {type: string; stand: string}) => {
    const btn = document.getElementById('_ai_inspectList_btn');
    if (btn) {
      btn.click();
    }
    const reqs = AiAPI.autoInspect(
      {articleId: itemDetail.id, content: editor!.getHtml(), contType: type, stand},
      (html) => {
        console.log(html);
        editor!.setHtml(toSafeHtml(html));
        const scroller = document.getElementById('_ai_editor_scroller')!;
        setTimeout(() => scroller.scrollTo({top: 999999999, behavior: 'smooth'}));
      },
      () => {
        setInspecting(undefined);
      },
      () => {
        setInspecting(undefined);
      }
    );
    setInspecting(reqs);
  });
  const onCancelInspecting = useEvent(() => {
    const reqs = inspecting;
    setInspecting(undefined);
    if (reqs) {
      reqs.abort();
    }
  });

  const onDocTitleChange = useEvent((title: string) => {
    const _docTitle = docTitle;
    setDocTitle(title);
    if (title === '') {
      setTimeout(() => {
        setDocTitle(_docTitle);
      });
    } else {
      DocAPI.updateDocName(itemDetail.id, title, itemDetail.docType).catch(() => {
        setDocTitle(_docTitle);
      });
    }
  });

  const onDocSizeChange = useEvent((size: '常规' | '全宽' | '超宽') => {
    DocAPI.updateDocSize(itemDetail.id, size, itemDetail.docType).then(() => {
      setSize(size);
    });
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
    setLoading('create');
    DocAPI.createDoc({folder: itemDetail.folder, title: '', contents: ''}, itemDetail.docType)
      .then(({id}) => {
        openArticle(`/admin/doc/item/edit/${id}?__c=_dialog`);
      })
      .finally(() => setLoading(''));
  });

  const onCreated = useEvent((editor: IDomEditor) => {
    setEditor(editor);
    editor.setHtml(source.html);
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
    if (itemDetail.docType === 'tpl') {
      return (
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/admin/doc/list/tpls" action="relaunch" target="window">
                  模版管理
                </Link>
              ),
            },
            {
              title: (
                <>
                  <span>{docTitle}</span>
                  {!collect ? (
                    <StarOutlined
                      className="anticon-star-outline"
                      onClick={() => DocAPI.collectItem(itemDetail.id, itemDetail.docType, true).then(() => setCollect(1))}
                    />
                  ) : (
                    <StarFilled onClick={() => DocAPI.collectItem(itemDetail.id, itemDetail.docType, false).then(() => setCollect(0))} />
                  )}
                </>
              ),
            },
          ]}
        />
      );
    }
    const arr = itemDetail.levelPath.map((item) => ({
      title: (
        <Link
          to={`${itemDetail.docType === 'con' ? '/admin/doc/list/conts' : '/admin/doc/list/maintain'}?id=${item.id}`}
          action="relaunch"
          target="window"
        >
          {item.folderName}
        </Link>
      ),
    }));
    arr.unshift({
      title: (
        <Link to={itemDetail.docType === 'con' ? '/admin/doc/list/conts' : '/admin/doc/list/maintain'} action="relaunch" target="window">
          {itemDetail.docType === 'con' ? '我的合同' : '我的文档'}
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

  const layoutSize = useMemo(() => {
    const menu: MenuProps = {
      selectedKeys: [size],
      items: [
        {
          label: '常规',
          key: '常规',
        },
        {
          label: '超宽',
          key: '超宽',
        },
        {
          label: '全宽',
          key: '全宽',
        },
      ],
      onClick: ({key}: {key: string}) => {
        onDocSizeChange(key as any);
      },
    };
    return menu;
  }, [onDocSizeChange, size]);

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
            {itemDetail.docType !== 'tpl' &&
              (loading === 'create' ? <Spin size="small" /> : <PlusOutlined className="icon-link" onClick={onCreatDoc} title="新建文档" />)}
            {itemDetail.docType !== 'tpl' && (
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
            )}
            {breadcrumb}
          </Space>
          <Space align="center" className="info">
            {itemDetail.readonly && <span>只读模式</span>}
            <div>
              <UserOutlined />
              <span> {itemDetail.createUserName}</span>
            </div>
            <div>
              <ClockCircleOutlined />
              <span> {itemDetail.createDate ? dayjs(itemDetail.createDate).format('YYYY-MM-DD HH:mm:ss') : ''} 创建</span>
            </div>
            {saving ? (
              <span id="_ai_saving" onClick={() => editor && onSave(editor)}>
                <Spin size="small" />
              </span>
            ) : (
              <CloudUploadOutlined />
            )}
            {/* <Undo className="undo" onClick={() => editor?.undo!()} />
            <Redo className="undo" onClick={() => editor?.redo!()} /> */}
          </Space>
        </div>
        <div className="cd">
          {editor && (
            <>
              <AIButton editor={editor} />
              <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" className="tools" />
              <AITpl editor={editor} />
              {(itemDetail.docType === 'doc' || itemDetail.docType === 'con') && <ReviewButton editor={editor} onClick={onReview} />}
              {itemDetail.docType === 'tpl' && <VarButton editor={editor} />}
              {itemDetail.docType === 'con' && <ContButton editor={editor} onSubmit={onInspect} />}
            </>
          )}
        </div>
        <div
          className="bd"
          id="_ai_editor_scroller"
          style={{
            margin: itemDetail.docType === 'tpl' ? '0' : 'auto',
            width: itemDetail.docType === 'tpl' ? (layout === 1 ? '100%' : '50%') : SizeEnum[size],
          }}
        >
          <header>
            <div className={'expand' + ` n${layout}`} onClick={() => setLayout(layout === 1 ? 0 : 1)} />
            <BlurInput
              id="_doc_title"
              data-doc={itemDetail.id}
              size="large"
              key={docTitle}
              value={docTitle}
              readOnly={itemDetail.readonly}
              className="doc-title"
              style={{background: '#fff'}}
              onChange={onDocTitleChange}
            />
          </header>
          <Editor
            defaultConfig={defaultConfig}
            onCreated={onCreated}
            onChange={onChange}
            //style={{minHeight: '500px'}}
            mode="default"
          />
        </div>
        {itemDetail.docType === 'tpl' && (
          <TplPreview id={itemDetail.id} title={docTitle} tpl={source.html} snapshot={itemDetail.snapshot} layout={layout} setLayout={setLayout} />
        )}
        <div className="ft">
          <span className="count">{source.text ? source.text.replace(/\n|\r/gm, '').length : ''}个字</span>
          <div>
            <Dropdown menu={layoutSize}>
              <span className="btn size"></span>
            </Dropdown>
            {editor && (
              <>
                <Outline editor={editor} />
                {itemDetail.docType === 'con' && <Inspect editor={editor} loading={Boolean(inspecting)} onCancel={onCancelInspecting} />}
                <Review editor={editor} loading={Boolean(reviewing)} onCancel={onCancelReview} />
                <Chart editor={editor} />
              </>
            )}
          </div>
        </div>
      </div>
    </DialogPage>
  );
};

export default memo(Component);
