import {DeleteOutlined, DownOutlined, SearchOutlined, StarFilled, StarOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead, setLoading as setGlobalLoading} from '@elux/react-web';
import {Button, Dropdown, Input, Popover, Space, Table, TableProps} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {GetActions, GetClientRouter} from '@/Global';
import {downloadFile, replaceBaseUrl} from '@/utils/request';
import {confirm, debounce, message, useEvent, useSingleWindow} from '@/utils/tools';
import {DocAPI} from '../../api';
import {ListItem, ListSearch, ListSummary} from '../../entity';
import styles from '../Maintain/index.module.less';
interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const {doc: docActions} = GetActions('doc');

const Component: FC<Props> = ({list, listSearch, listSummary, dispatch}) => {
  const singleWindow = useSingleWindow();
  const [loading, setLoading] = useState<'create' | 'createDir' | 'upload' | 'batchDelete' | ''>('');
  const [selectedRows, setSelectedRows] = useState<{ids: string[]; rows: ListItem[]}>({ids: [], rows: []});
  const [scrollHeight, setScrollHeight] = useState(() => window.innerHeight - 275);
  const [showRename, setShowRename] = useState('');
  const [showMove, setShowMove] = useState('');

  const refreshList = useCallback(() => {
    return dispatch(docActions.fetchList());
  }, [dispatch]);

  const onShowDetail = useEvent((id: string, type: 'dir' | 'doc') => {
    if (type === 'doc') {
      GetClientRouter().push({url: `/admin/doc/item/edit/${id}?__c=_dialog`}, singleWindow);
    } else {
      GetClientRouter().push({url: `/admin/doc/list/maintain?id=${id}`}, 'page');
    }
  });

  const onRename = useEvent((id: string, type: 'doc' | 'dir', name: string) => {
    if (type === 'doc') {
      DocAPI.updateDocName(id, name).then(refreshList);
    } else {
      DocAPI.updateDirName(id, name).then(refreshList);
    }
    setShowRename('');
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
            <a className={'ico-' + row.type} title={text} onClick={() => onShowDetail(row.id, row.type)}>
              {text}
            </a>
            {row.type === 'dir' ? null : !row.collect ? (
              <StarOutlined className="anticon-star-outline" onClick={() => DocAPI.collectItem(row.id, row.type, !row.collect).then(refreshList)} />
            ) : (
              <StarFilled onClick={() => DocAPI.collectItem(row.id, row.type, !row.collect).then(refreshList)} />
            )}
          </div>
        ),
      },
      {
        title: '文档字数',
        dataIndex: 'articleCount',
        key: 'articleCount',
        width: 140,
        render: (num, row) => {
          return row.articleId ? `${num}字` : '';
        },
      },
      {
        title: '所有者',
        dataIndex: 'createUserName',
        key: 'createUserName',
        width: 140,
      },
      {
        title: '最后修改时间',
        dataIndex: 'updateDate',
        key: 'updateDate',
        width: 180,
        sorter: true,
        sortOrder: (listSearch.sorterField === 'updateDate' && listSearch.sorterOrder) || null,
      },
      {
        title: '操作',
        key: 'action',
        width: 250,
        render: (_: any, record) => (
          <Space size="middle">
            <Popover
              trigger="click"
              destroyTooltipOnHide
              open={showRename === record.id}
              onOpenChange={(open) => {
                setShowRename(open ? record.id : '');
              }}
              content={
                <Input
                  allowClear
                  style={{width: '200px'}}
                  defaultValue={record.title}
                  onBlur={(e: any) => {
                    const value = e.target.value.trim();
                    if (value && value !== record.title) {
                      onRename(record.id, record.type, e.target.value);
                    }
                  }}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      const value = e.target.value.trim();
                      if (value && value !== record.title) {
                        onRename(record.id, record.type, e.target.value);
                      }
                    }
                  }}
                />
              }
            >
              <a>重命名</a>
            </Popover>
            <Dropdown
              menu={{
                onClick: ({key}: {key: string}) => {
                  if (key === '删除') {
                    confirm(`您确定要删除《${record.title}》吗？`, (ok) => {
                      if (ok) {
                        DocAPI.deleteItem(record.id, record.type).then(refreshList);
                      }
                    });
                  } else if (key === '下载Word') {
                    setGlobalLoading(
                      downloadFile(replaceBaseUrl(`/dream/pen/article/down?id=${record.id}&type=word`), record.title),
                      GetClientRouter().getActivePage().store
                    );
                  } else if (key === '下载PDF') {
                    setGlobalLoading(
                      downloadFile(replaceBaseUrl(`/dream/pen/article/down?id=${record.id}&type=pdf`), record.title),
                      GetClientRouter().getActivePage().store
                    );
                  }
                },
                items:
                  record.type === 'doc'
                    ? [
                        {
                          key: '下载Word',
                          label: '下载Word',
                        },
                        {
                          key: '下载PDF',
                          label: '下载PDF',
                        },
                        {key: '删除', label: '删除'},
                      ]
                    : [{key: '删除', label: '删除'}],
              }}
            >
              <a>
                更多 <DownOutlined style={{fontSize: 12}} />
              </a>
            </Dropdown>
          </Space>
        ),
      },
    ];
  }, [showRename, showMove, listSearch, listSummary]);

  const batchDelete = useEvent(() => {
    confirm(`您确定要删除${selectedRows.rows.length}项吗？`, (ok) => {
      if (ok) {
        setLoading('batchDelete');
        DocAPI.batchDelete(selectedRows.rows.map((item) => ({id: item.id, type: item.type})))
          .then(() => {
            setSelectedRows({ids: [], rows: []});
            refreshList();
          })
          .finally(() => setLoading(''));
      }
    });
  });

  const rowSelection: TableProps<any>['rowSelection'] = useMemo(
    () => ({
      selectedRowKeys: selectedRows.ids,
      onChange: (selectedRowKeys: any[], selectedRows: any[]) => {
        setSelectedRows({ids: selectedRowKeys, rows: selectedRows});
        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: (record: any) => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    }),
    [selectedRows]
  );

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
      <DocumentHead title="我的收藏" />
      <div className="hd">
        <span className="ant-breadcrumb">我的收藏</span>
        <Input.Search allowClear className="search" placeholder="请输入搜索关键字..." onSearch={onSearch} />
      </div>
      <div className="cd">
        <Space>
          <Button loading={loading === 'batchDelete'} icon={<DeleteOutlined />} onClick={batchDelete} disabled={!selectedRows.ids.length}>
            批量删除
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
          rowSelection={rowSelection}
          pagination={false}
          scroll={{y: scrollHeight}}
          onChange={onTableChange}
        />
      </div>
    </div>
  );
};

export default memo(Component);
