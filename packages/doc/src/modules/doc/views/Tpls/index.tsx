import {EllipsisOutlined, PlusOutlined, StarFilled, StarOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead, setLoading as setGlobalLoading} from '@elux/react-web';
import {Button, Dropdown, Form, Input, Modal, Popover, Space} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {GetActions, GetClientRouter} from '@/Global';
import {downloadFile, replaceBaseUrl} from '@/utils/request';
import {confirm, debounce, message, useEvent, useSingleWindow} from '@/utils/tools';
import {DocAPI} from '../../api';
import {ListItem, ListSearch, ListSummary} from '../../entity';
import styles from '../Maintain/index.module.less';
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
  const [loading, setLoading] = useState<'create' | ''>('');
  const [scrollHeight, setScrollHeight] = useState(() => window.innerHeight - 215);
  const [curEdit, setCurEdit] = useState<ListItem>();
  const [showMove, setShowMove] = useState('');

  const refreshList = useCallback(() => {
    return dispatch(docActions.fetchList());
  }, [dispatch]);

  const onCloseEdit = useEvent(() => {
    setCurEdit(undefined);
  });

  const onCreate = useEvent(() => {
    setCurEdit({} as ListItem);
  });

  const onEditSubmit = useEvent((data: {title: string; remark: string}) => {
    const curId = curEdit?.id || '';
    DocAPI.saveTpl({...data, id: curId}).then(async ({id}) => {
      setCurEdit(undefined);
      await refreshList();
      if (!curId) {
        GetClientRouter().push({url: `/admin/doc/item/tpl/${id}?__c=_dialog`}, singleWindow);
      }
    });
  });

  const onApplyTpl = useEvent((tplId: string) => {
    DocAPI.createDoc(tplId).then(({id}) => {
      GetClientRouter().push({url: `/admin/doc/item/edit/${id}?__c=_dialog`}, singleWindow);
    });
  });

  const onSearch = useEvent((name: string) => {
    dispatch(docActions.fetchList({...listSearch, name}));
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
            <div className={styles.card} key={item.id} onClick={() => onApplyTpl(item.id)}>
              {item.collect ? <StarFilled className="collect" /> : <StarOutlined className="collect anticon-star-outline" />}
              <div className="title">{item.title}</div>
              <div className="remark">{item.remark}</div>
              <div className="tags">
                <span className={item.isSystem ? 'on' : ''}>{item.isSystem ? '系统模版' : '个人模版'}</span>
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
                      } else if (key === 'detail') {
                        GetClientRouter().push({url: `/admin/doc/item/tpl/${item.id}?__c=_dialog`}, singleWindow);
                      }
                    },
                    items: [
                      {
                        key: 'apply',
                        label: '立即使用',
                      },
                      {
                        key: 'detail',
                        label: '编辑模版',
                      },
                      {
                        key: 'edit',
                        label: '修改信息',
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
    </div>
  );
};

export default memo(Component);
