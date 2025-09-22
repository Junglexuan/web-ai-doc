import {EllipsisOutlined, EyeOutlined, PlusOutlined, StarFilled, StarOutlined, UploadOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Input, Modal, Space, Upload, UploadProps} from 'antd';
import {FC, MouseEvent, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {GetActions, SiteInfo} from '@/Global';
import {getUploadProps} from '@/utils/request';
import {confirm, debounce, openArticle, useEvent} from '@/utils/tools';
import {DocAPI} from '../../api';
import {ListItem, ListSearch, ListSummary, defaultListSearch} from '../../entity';
import styles from '../Maintain/index.module.less';
import Preview from '../Preview';
import Wizard, {WizardFormData} from '../Wizard';
import Edit from './Edit';
import styles2 from './index.module.less';

interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
  inDialog?: boolean;
}

const {doc: docActions} = GetActions('doc');

const Component: FC<Props> = ({list, listSearch, inDialog, dispatch}) => {
  const [loading, setLoading] = useState<'upload' | ''>('');
  const [scrollHeight, setScrollHeight] = useState(() => (inDialog ? 715 : window.innerHeight - 215));
  const [curEdit, setCurEdit] = useState<ListItem>();
  const [wizardData, setWizardData] = useState<WizardFormData>();
  const [previewTpl, setPreviewTpl] = useState<string>();

  const refreshList = useCallback(() => {
    return dispatch(docActions.fetchList());
  }, [dispatch]);

  const onCloseEdit = useEvent(() => {
    setCurEdit(undefined);
  });

  const onCreate = useEvent(() => {
    setCurEdit({isShare: true} as ListItem);
  });

  const onCollect = useEvent((e: any, id: string, collect: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    DocAPI.collectItem(id, 'tpl', collect).then(refreshList);
  });

  const onEditSubmit = useEvent((data: {title: string; remark: string; isShare: boolean}) => {
    const curId = curEdit?.id || '';
    DocAPI.saveTpl({...data, id: curId}, 'tpl').then(async ({id}) => {
      setCurEdit(undefined);
      await refreshList();
      if (!curId) {
        openArticle(`/admin/doc/item/tpl/${id}?__c=_dialog`);
      }
    });
  });

  const onCreateByTpl = useEvent((tplId: string, fields?: {[field: string]: string}, knowledges?: string[]) => {
    DocAPI.getDoc(tplId).then((tpl) => {
      if (tpl.format === '2') {
        alert('生成word文档');
      } else {
        DocAPI.createDoc({folder: '0', title: tpl.title, contents: ''}, 'doc').then(async ({id}) => {
          const data = {id: tplId, fields, knowledges};
          console.log(data);
          window.sessionStorage.setItem('__temp_tpl__', JSON.stringify(data));
          openArticle(`/admin/doc/item/edit/${id}?&tpl=${tpl.id}&__c=_dialog`);
        });
      }
    });
  });

  const onApplyTpl = useEvent((tplId: string) => {
    DocAPI.getTplFields(tplId).then((fields) => {
      setWizardData({tplId, fields});
    });
  });

  const onShowTpl = useEvent((evt: MouseEvent, tplId: string) => {
    openArticle(`/admin/doc/item/tpl/${tplId}?__c=_dialog`);
  });

  const onSearch = useEvent((name: string) => {
    dispatch(docActions.fetchList({...listSearch, name}));
  });

  const onWizardSubmit = useEvent((tplId: string, fields: {[field: string]: string}, knowledges: string[]) => {
    setWizardData(undefined);
    onCreateByTpl(tplId, fields, knowledges);
  });

  const uploadProps: UploadProps = useMemo(
    () =>
      getUploadProps('/dream/pen/template/upload', {
        onProcess: () => setLoading('upload'),
        onSuccess: () => {
          setLoading('');
          refreshList();
        },
        onError: () => setLoading(''),
      }),
    [refreshList]
  );

  useEffect(() => {
    const onResize = debounce(() => !inDialog && setScrollHeight(window.innerHeight - 215), 300);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.root}>
      <DocumentHead title={'模版管理-' + SiteInfo.name} />
      <div className="hd">
        <div className={styles2.tab}>
          <div
            className={listSearch.owner === 'mine' ? '' : 'on'}
            onClick={() => dispatch(docActions.fetchList({...listSearch, name: undefined, owner: undefined}))}
          >
            全部模版
          </div>
          <div
            className={listSearch.owner === 'mine' ? 'on' : ''}
            onClick={() => dispatch(docActions.fetchList({...listSearch, name: undefined, owner: 'mine'}))}
          >
            我的模版
          </div>
        </div>
        <Input.Search allowClear className="search" placeholder="请输入搜索关键字..." onSearch={onSearch} />
      </div>
      {inDialog ? (
        <div style={{height: '5px'}}></div>
      ) : (
        <div className="cd">
          <Space>
            <Button color="primary" variant="outlined" icon={<PlusOutlined />} onClick={onCreate}>
              创建模版
            </Button>
            <Upload showUploadList={false} accept=".docx" {...uploadProps}>
              <Button loading={loading === 'upload'} icon={<UploadOutlined />}>
                上传文档
              </Button>
            </Upload>
          </Space>
        </div>
      )}
      <div className="md" style={{height: scrollHeight}}>
        {list.map((item) => {
          return (
            <div className={styles2.card} key={item.id}>
              {item.collect ? (
                <StarFilled className="collect" onClick={(e) => onCollect(e, item.id, !item.collect)} />
              ) : (
                <StarOutlined className="collect anticon-star-outline" onClick={(e) => onCollect(e, item.id, !item.collect)} />
              )}
              <div className={'title icon' + item.format}>{item.title}</div>
              <div className="remark">{item.remark}</div>
              <div className="tags">
                <span className={item.isSystem ? 'on' : ''}>{item.isSystem ? '系统模版' : item.isShare ? '共享模版' : '个人模版'}</span>
              </div>
              <div className="creater">
                <span>{`${item.createUserName} 创建于 ${item.createDate}`}</span>
              </div>
              <div
                title={item.remark}
                className={'mask ' + styles2.mask}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    onShowTpl(e as MouseEvent, item.id);
                  }
                }}
              >
                {item.collect ? (
                  <StarFilled className="collect" onClick={(e) => onCollect(e, item.id, !item.collect)} />
                ) : (
                  <StarOutlined className="collect anticon-star-outline" onClick={(e) => onCollect(e, item.id, !item.collect)} />
                )}
                {!item.isMine || inDialog ? (
                  <div className="ant-btn preview" onClick={() => setPreviewTpl(item.id)}>
                    <EyeOutlined />
                  </div>
                ) : (
                  <div className="ant-btn more">
                    <EllipsisOutlined />
                    <div className="dropdown">
                      <div onClick={() => setPreviewTpl(item.id)}>预览模版</div>
                      <div onClick={() => setCurEdit(item)}>修改信息</div>
                      <div
                        onClick={() => {
                          confirm(`您确定要删除《${item.title}》吗？`, (ok) => {
                            if (ok) {
                              DocAPI.deleteItem(item.id, 'tpl').then(refreshList);
                            }
                          });
                        }}
                      >
                        删除模版
                      </div>
                    </div>
                  </div>
                )}
                <div className="ant-btn use" onClick={() => onApplyTpl(item.id)}>
                  立即使用
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {curEdit && (
        <Modal title={curEdit.id ? '修改信息' : '创建模版'} open={true} footer={null} onCancel={onCloseEdit}>
          <Edit data={curEdit} onCancel={onCloseEdit} onSubmit={onEditSubmit} />
        </Modal>
      )}
      {wizardData && <Wizard data={wizardData} onCancel={() => setWizardData(undefined)} onSubmit={onWizardSubmit} />}
      {previewTpl && <Preview tplId={previewTpl} onCancel={() => setPreviewTpl(undefined)} onApply={onApplyTpl} />}
    </div>
  );
};

export default memo(Component);
