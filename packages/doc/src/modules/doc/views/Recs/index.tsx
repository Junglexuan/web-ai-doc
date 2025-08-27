import {DeleteOutlined, StarFilled, StarOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Input, Space, Table, TableProps} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {GetActions, SiteInfo} from '@/Global';
import {confirm, debounce, useEvent} from '@/utils/tools';
import {DocAPI} from '../../api';
import {DocType, ListItem, ListSearch, ListSummary} from '../../entity';
import styles from '../Maintain/index.module.less';
interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const {doc: docActions} = GetActions('doc');

const Component: FC<Props> = ({list, listSearch, listSummary, dispatch}) => {
  const [loading, setLoading] = useState<'create' | 'createDir' | 'upload' | 'batchDelete' | ''>('');
  const [scrollHeight, setScrollHeight] = useState(() => window.innerHeight - 275);

  const refreshList = useCallback(() => {
    return dispatch(docActions.fetchList());
  }, [dispatch]);

  const onDeleteItem = useEvent((id: string, type: DocType, title: string) => {
    confirm(`您确定要彻底删除《${title}》吗？`, (ok) => {
      if (ok) {
        DocAPI.cleanItem(id, type).then(refreshList);
      }
    });
  });

  const onRestoreItem = useEvent((id: string, type: DocType) => {
    DocAPI.restoreItem(id, type).then(refreshList);
  });

  const onSearch = useEvent((name: string) => {
    dispatch(docActions.fetchList({...listSearch, name}));
  });

  const columns = useMemo<TableProps<ListItem>['columns']>(() => {
    return [
      {
        title: '名称',
        dataIndex: 'title',
        key: 'title',
        render: (text, row) => (
          <div className="file-name">
            <a className={'ico-' + row.type} title={text}>
              {text}
            </a>
          </div>
        ),
      },
      {
        title: '文档字数',
        dataIndex: 'articleCount',
        key: 'articleCount',
        width: 140,
        render: (num, row) => {
          return `${num || 0}字`;
        },
      },
      {
        title: '所有者',
        dataIndex: 'createUserName',
        key: 'createUserName',
        width: 150,
      },
      {
        title: '最后修改时间',
        dataIndex: 'updateDate',
        key: 'updateDate',
        width: 200,
        sorter: true,
        sortOrder: (listSearch.sorterField === 'updateDate' && listSearch.sorterOrder) || null,
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_: any, record) => (
          <Space size="middle">
            <a onClick={() => onRestoreItem(record.id, record.type)}>恢复</a>
            <a onClick={() => onDeleteItem(record.id, record.type, record.title)}>删除</a>
          </Space>
        ),
      },
    ];
  }, [listSearch, listSummary]);

  const batchDelete = useEvent(() => {
    confirm(`您确定要清空回收站吗？`, (ok) => {
      if (ok) {
        setLoading('batchDelete');
        DocAPI.cleanRecycle()
          .then(() => {
            refreshList();
          })
          .finally(() => setLoading(''));
      }
    });
  });

  const onTableChange = useEvent((pagination: any, filter: any, _sorter: any) => {
    const sorter = _sorter as {field: string; order: 'ascend' | 'descend' | undefined};
    const sorterField = (sorter.order && sorter.field) || undefined;
    const sorterOrder = sorter.order || undefined;
    return dispatch(docActions.fetchList({...listSearch, sorterField, sorterOrder}));
  });

  useEffect(() => {
    const onResize = debounce(() => setScrollHeight(window.innerHeight - 275), 300);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.root}>
      <DocumentHead title={'回收站-' + SiteInfo.name} />
      <div className="hd">
        <span className="ant-breadcrumb">回收站</span>
        <Input.Search allowClear className="search" placeholder="请输入搜索关键字..." onSearch={onSearch} />
      </div>
      <div className="cd">
        <Space>
          <Button loading={loading === 'batchDelete'} icon={<DeleteOutlined />} onClick={batchDelete}>
            清空
          </Button>
        </Space>
      </div>
      <div className="bd">
        <Table<any>
          columns={columns}
          rowKey="id"
          dataSource={list}
          size="middle"
          className="g-table-dir"
          pagination={false}
          scroll={{y: scrollHeight}}
          onChange={onTableChange}
        />
      </div>
    </div>
  );
};

export default memo(Component);
