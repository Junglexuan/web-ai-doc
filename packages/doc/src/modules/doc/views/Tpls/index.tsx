import {EllipsisOutlined, PlusOutlined, StarFilled, StarOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Dropdown, Input, Modal} from 'antd';
import {FC, memo, useCallback, useEffect, useState} from 'react';
import {GetActions, GetClientRouter} from '@/Global';
import {confirm, debounce, useEvent, useSingleWindow} from '@/utils/tools';
import {DocAPI} from '../../api';
import {ListItem, ListSearch, ListSummary} from '../../entity';
import styles from '../Maintain/index.module.less';
import Wizard, {WizardFormData} from '../Wizard';
import Edit from './Edit';

interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const {doc: docActions} = GetActions('doc');

const Component: FC<Props> = ({list, listSearch, listSummary, dispatch}) => {
  const singleWindow = useSingleWindow();
  const [scrollHeight, setScrollHeight] = useState(() => window.innerHeight - 215);
  const [curEdit, setCurEdit] = useState<ListItem>();
  const [wizardData, setWizardData] = useState<WizardFormData>();

  const refreshList = useCallback(() => {
    return dispatch(docActions.fetchList());
  }, [dispatch]);

  const onCloseEdit = useEvent(() => {
    setCurEdit(undefined);
  });

  const onCreate = useEvent(() => {
    setCurEdit({} as ListItem);
  });

  const onCollect = useEvent((e: any, id: string, collect: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    DocAPI.collectItem(id, 'tpl', collect).then(refreshList);
  });

  const onEditSubmit = useEvent((data: {title: string; remark: string; isShare: boolean}) => {
    const curId = curEdit?.id || '';
    DocAPI.saveTpl({...data, id: curId}).then(async ({id}) => {
      setCurEdit(undefined);
      await refreshList();
      if (!curId) {
        GetClientRouter().push({url: `/admin/doc/item/tpl/${id}?__c=_dialog`}, singleWindow);
      }
    });
  });

  const onCreateByTpl = useEvent((tplId: string, fields?: {[field: string]: string}) => {
    DocAPI.getDoc({id: tplId, render: 'tpl'}).then((tpl) => {
      DocAPI.createDoc({folder: '0', title: tpl.title, contents: ''}).then(async ({id}) => {
        window.sessionStorage.setItem('__temp_tpl__', JSON.stringify({id: tplId, fields}));
        GetClientRouter().push({url: `/admin/doc/item/edit/${id}?&tpl=${tpl.id}&__c=_dialog`}, singleWindow);
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

  const onShowTpl = useEvent((tplId: string) => {
    GetClientRouter().push({url: `/admin/doc/item/tpl/${tplId}?__c=_dialog`}, singleWindow);
  });

  const onSearch = useEvent((name: string) => {
    dispatch(docActions.fetchList({...listSearch, name}));
  });

  const onWizardSubmit = useEvent(({__tplId, ...fields}: {__tplId: string; [field: string]: string}) => {
    setWizardData(undefined);
    onCreateByTpl(__tplId, fields);
  });

  useEffect(() => {
    const onResize = debounce(() => setScrollHeight(window.innerHeight - 215), 300);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.root}>
      <DocumentHead title="模版管理" />
      <div className="hd">
        <span className="ant-breadcrumb">模版管理</span>
        <Input.Search allowClear className="search" placeholder="请输入搜索关键字..." onSearch={onSearch} />
      </div>
      <div className="cd" style={{padding: '20px 0'}}>
        <Button color="primary" variant="outlined" icon={<PlusOutlined />} onClick={onCreate}>
          创建模版
        </Button>
      </div>
      <div className="md" style={{height: scrollHeight}}>
        {list.map((item) => {
          return (
            <div className={styles.card} key={item.id} onClick={() => onShowTpl(item.id)}>
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
                <Dropdown
                  menu={{
                    onClick({key, domEvent}) {
                      domEvent.stopPropagation();
                      domEvent.preventDefault();
                      if (key === 'edit') {
                        setCurEdit(item);
                      } else if (key === 'delete') {
                        confirm(`您确定要删除《${item.title}》吗？`, (ok) => {
                          if (ok) {
                            DocAPI.deleteTpl(item.id).then(refreshList);
                          }
                        });
                      } else if (key === 'apply') {
                        onApplyTpl(item.id);
                      }
                    },
                    items: [
                      {
                        key: 'apply',
                        label: '立即使用',
                      },
                      {
                        key: 'edit',
                        label: '重命名',
                      },
                      {
                        key: 'delete',
                        label: '删除模版',
                      },
                    ],
                  }}
                >
                  <EllipsisOutlined />
                </Dropdown>
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
