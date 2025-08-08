import {EllipsisOutlined, EyeOutlined, PlusOutlined, StarFilled, StarOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead, Link} from '@elux/react-web';
import {Button, Input, Modal} from 'antd';
import {FC, MouseEvent, memo, useCallback, useEffect, useState} from 'react';
import {GetActions, SiteInfo} from '@/Global';
import {confirm, debounce, openArticle, useEvent} from '@/utils/tools';
import {DocAPI} from '../../api';
import {ListItem, ListSearch, ListSummary} from '../../entity';
import styles from '../Maintain/index.module.less';
import Wizard, {WizardFormData} from '../Wizard';
import Edit from './Edit';
import styles2 from './index.module.less';

interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const {doc: docActions} = GetActions('doc');

const Component: FC<Props> = ({list, listSearch, listSummary, dispatch}) => {
  const [scrollHeight, setScrollHeight] = useState(() => window.innerHeight - 205);
  const [curEdit, setCurEdit] = useState<ListItem>();
  const [wizardData, setWizardData] = useState<WizardFormData>();

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
      DocAPI.createDoc({folder: '0', title: tpl.title, contents: ''}, 'doc').then(async ({id}) => {
        const data = {id: tplId, fields, knowledges};
        console.log(data);
        window.sessionStorage.setItem('__temp_tpl__', JSON.stringify(data));
        openArticle(`/admin/doc/item/edit/${id}?&tpl=${tpl.id}&__c=_dialog`);
      });
    });
  });

  const onApplyTpl = useEvent((tplId: string) => {
    DocAPI.getTplFields(tplId).then((fields) => {
      if (fields.length) {
        setWizardData({tplId, fields});
      } else {
        onCreateByTpl(tplId);
      }
    });
  });

  const onShowTpl = useEvent((evt: MouseEvent, tplId: string) => {
    openArticle(`/admin/doc/item/tpl/${tplId}?__c=_dialog`);
  });

  const onSearch = useEvent((name: string) => {
    dispatch(docActions.fetchList({...listSearch, name}));
  });

  const onTabChange = useEvent((type: string) => {
    dispatch(docActions.fetchList({...listSearch, name: undefined, type}));
  });

  const onWizardSubmit = useEvent((tplId: string, fields: {[field: string]: string}, knowledges: string[]) => {
    setWizardData(undefined);
    onCreateByTpl(tplId, fields, knowledges);
  });

  useEffect(() => {
    const onResize = debounce(() => setScrollHeight(window.innerHeight - 205), 300);
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
          <Link className={listSearch.owner === 'mine' ? '' : 'on'} to="/admin/doc/list/tpls" action="relaunch" target="window">
            全部模版
          </Link>
          <Link className={listSearch.owner === 'mine' ? 'on' : ''} to="/admin/doc/list/tpls?owner=mine" action="relaunch" target="window">
            我的模版
          </Link>
        </div>
        <Input.Search value={listSearch.name} allowClear className="search" placeholder="请输入搜索关键字..." onSearch={onSearch} />
      </div>
      <div className="cd" style={{padding: '15px 0 20px'}}>
        <Button color="primary" variant="outlined" icon={<PlusOutlined />} onClick={onCreate}>
          创建模版
        </Button>
      </div>
      <div className="md" style={{height: scrollHeight}}>
        {list.map((item) => {
          return (
            <div className={styles2.card} key={item.id}>
              {item.collect ? (
                <StarFilled className="collect" onClick={(e) => onCollect(e, item.id, !item.collect)} />
              ) : (
                <StarOutlined className="collect anticon-star-outline" onClick={(e) => onCollect(e, item.id, !item.collect)} />
              )}
              <div className="title">{item.title}</div>
              <div className="remark">{item.remark}</div>
              <div className="tags">
                <span className={item.isSystem ? 'on' : ''}>{item.isSystem ? '系统模版' : item.isShare ? '共享模版' : '个人模版'}</span>
              </div>
              <div className="creater">
                <span>{`${item.createUserName} 创建于 ${item.createDate}`}</span>
              </div>
              <div className={'mask ' + styles2.mask}>
                {item.isSystem || item.isShare ? (
                  <div className="ant-btn">
                    <EyeOutlined />
                  </div>
                ) : (
                  <div className="ant-btn more">
                    <EllipsisOutlined />
                    <div className="dropdown">
                      <div>预览模版</div>
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
      {wizardData && <Wizard data={wizardData} onCancel={() => setWizardData(undefined)} onsubmit={onWizardSubmit} />}
    </div>
  );
};

export default memo(Component);
