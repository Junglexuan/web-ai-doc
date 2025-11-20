import {PlusOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Input, Modal, Select, Space, Table, TableProps} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {GetActions} from '@/Global';
import {confirm, debounce, useEvent} from '@/utils/tools';
import {ContractReviewAPI} from '../../api';
import {ListItem, ListSearch, ListSummary} from '../../entity';
import Edit from '../Edit';
import styles from './index.module.less';
interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const {contractReview: contractReviewActions} = GetActions('contractReview');

const Component: FC<Props> = ({list, listSearch, listSummary, dispatch}) => {
  const [scrollHeight, setScrollHeight] = useState(() => window.innerHeight - 285);
  const [curEdit, setCurEdit] = useState<ListItem>();
  const [cateOptions, setCateOptions] = useState<{label: string; value: string}[]>([]);

  const refreshList = useCallback(() => {
    return dispatch(contractReviewActions.fetchList());
  }, [dispatch]);

  const onCreate = useEvent(() => {
    setCurEdit({} as ListItem);
  });

  const onCloseEdit = useEvent(() => {
    setCurEdit(undefined);
  });

  const onEditSubmit = useEvent((data: ListItem) => {
    const curId = curEdit?.id || '';
    setCurEdit(undefined);
    if (curId) {
      ContractReviewAPI.updateItem(curId, data).then(refreshList);
    } else {
      ContractReviewAPI.createItem(data).then(refreshList);
    }
  });

  const onDelete = useEvent((id: string) => {
    confirm(`您确定要删除吗？删除后不可恢复！`, (ok) => {
      if (ok) {
        ContractReviewAPI.deleteItem(id).then(refreshList);
      }
    });
  });

  const onCateChange = useEvent((type: number) => {
    dispatch(contractReviewActions.fetchList({...listSearch, type}));
  });

  const onSearch = useEvent((keyWord: string) => {
    dispatch(contractReviewActions.fetchList({...listSearch, keyWord}));
  });

  useEffect(() => {
    ContractReviewAPI.getCateList().then(setCateOptions);
    const onResize = debounce(() => setScrollHeight(window.innerHeight - 285), 300);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.root}>
      <DocumentHead title="合同审查规则" />
      <div className="hd">
        <Select allowClear placeholder="分类过滤" options={cateOptions} value={listSearch.type} onChange={onCateChange}></Select>
        <Input.Search allowClear className="search" placeholder="请输入搜索关键字..." onSearch={onSearch} />
      </div>
      <div className="cd">
        <Space align="end">
          <Button color="primary" variant="outlined" icon={<PlusOutlined />} onClick={onCreate}>
            添加规则
          </Button>
        </Space>
      </div>
      <div className="bd">
        <div className={styles.list}>
          {list.map((item) => {
            return (
              <div className={styles.card} key={item.id}>
                FDSFSD
              </div>
            );
          })}
        </div>
      </div>
      {curEdit && (
        <Modal title={curEdit.id ? '修改规则' : '创建规则'} open={true} footer={null} onCancel={onCloseEdit}>
          <Edit cateOptions={cateOptions} data={curEdit} onCancel={onCloseEdit} onSubmit={onEditSubmit} />
        </Modal>
      )}
    </div>
  );
};

export default memo(Component);
