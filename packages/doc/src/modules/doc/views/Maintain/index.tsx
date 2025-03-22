import {DeleteOutlined, DownOutlined, ExceptionOutlined, FolderAddOutlined, PlusOutlined, StarFilled, UploadOutlined} from '@ant-design/icons';
import {DocumentHead} from '@elux/react-web';
import {Breadcrumb, Button, Dropdown, Space, Table, TableProps, Upload} from 'antd';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import {GetClientRouter} from '@/Global';
import {getUrlParam, message, useEvent, useSingleWindow} from '@/utils/tools';
import {DocAPI} from '../../api';
import {ListItem, ListSearch, ListSummary} from '../../entity';
import styles from './index.module.less';

const moreActions = {
  items: [
    {key: '1', label: '分享'},
    {key: '2', label: '移动到'},
    {key: '3', label: '下载'},
    {key: '4', label: '删除'},
  ],
};

interface Props {
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const Component: FC<Props> = ({list, listSearch, listSummary}) => {
  const singleWindow = useSingleWindow();
  const [loading, setLoading] = useState<'create' | 'createDir' | ''>('');

  const onShowDetail = useEvent((id: string, type: 'dir' | 'doc') => {
    if (type === 'doc') {
      GetClientRouter().push({url: `/admin/doc/item/edit/${id}?__c=_dialog`}, singleWindow);
    } else {
      GetClientRouter().push({url: `/admin/doc/list/maintain?id=${id}`}, 'page');
    }
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
            {!!row.collect && <StarFilled />}
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
        dataIndex: 'address',
        key: 'address',
        width: 140,
      },
      {
        title: '最后修改时间',
        dataIndex: 'date',
        key: 'date',
        width: 170,
      },
      {
        title: '操作',
        key: 'action',
        width: 250,
        render: (_: any, record: any) => (
          <Space size="middle">
            <a>重命名</a>
            <a>复制</a>
            <a>收藏</a>
            <Dropdown menu={moreActions}>
              <a>
                更多 <DownOutlined style={{fontSize: 12}} />
              </a>
            </Dropdown>
          </Space>
        ),
      },
    ];
  }, [onShowDetail]);

  const onCreate = useEvent(() => {
    setLoading('create');
    DocAPI.createDoc({folder: listSearch.id || '0', contents: ''})
      .then(async ({id}) => {
        await GetClientRouter().back(0);
        GetClientRouter().push({url: `/admin/doc/item/edit/${id}?__c=_dialog`}, singleWindow);
      })
      .catch((e) => {
        message.error(e + '');
      })
      .finally(() => setLoading(''));
  });

  const onCreateDir = useEvent(() => {
    setLoading('createDir');
    DocAPI.createDir({folder: listSearch.id || '0'})
      .then(() => GetClientRouter().back(0))
      .catch((e) => {
        message.error(e + '');
      })
      .finally(() => setLoading(''));
  });

  const rowSelection: TableProps<any>['rowSelection'] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  return (
    <div className={'g-page-content ' + styles.root}>
      <DocumentHead title="我的文档" />
      <div className="hd">
        <Breadcrumb
          items={[
            {
              title: '我的文档',
            },
          ]}
        />
      </div>
      <div className="cd">
        <Space>
          <Button id="_create-doc-btn" loading={loading === 'create'} icon={<PlusOutlined />} onClick={onCreate}>
            起草公文
          </Button>
          <Button icon={<ExceptionOutlined />}>创建模版</Button>
          <Button loading={loading === 'createDir'} icon={<FolderAddOutlined />} onClick={onCreateDir}>
            新建文件夹
          </Button>
          <Upload>
            <Button icon={<UploadOutlined />}>上传文档</Button>
          </Upload>
          <Button icon={<DeleteOutlined />}>批量删除</Button>
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
        />
      </div>
    </div>
  );
};

export default memo(Component);
