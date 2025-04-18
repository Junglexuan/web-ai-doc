import {DeleteOutlined, DownOutlined, ExceptionOutlined, FolderAddOutlined, PlusOutlined, StarFilled, UploadOutlined} from '@ant-design/icons';
import {DocumentHead, Link} from '@elux/react-web';
import {Breadcrumb, Button, Dropdown, Form, Input, Popover, Space, Table, TableProps, Upload} from 'antd';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import EasyEdit from '@/components/EasyEdit';
import {GetClientRouter} from '@/Global';
import {replaceBaseUrl} from '@/utils/request';
import {confirm, getUrlParam, message, useEvent, useSingleWindow} from '@/utils/tools';
import {DocAPI} from '../../api';
import {ListItem, ListSearch, ListSummary} from '../../entity';
import styles from './index.module.less';
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

  const onRename = useEvent((id: string, type: 'doc' | 'dir', name: string) => {
    if (type === 'doc') {
      DocAPI.updateDocName(id, name).then(() => GetClientRouter().back(0));
    } else {
      DocAPI.updateDirName(id, name).then(() => GetClientRouter().back(0));
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
        render: (_: any, record) => (
          <Space size="middle">
            <Popover
              trigger="click"
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
            <a>复制</a>
            <a>收藏</a>
            <Dropdown
              menu={{
                onClick: ({key}: {key: string}) => {
                  if (key === '删除') {
                    confirm('您确定要删除吗？', (ok) => {
                      if (ok) {
                        if (record.type === 'doc') {
                          DocAPI.deleteDoc(record.id).then(() => GetClientRouter().back(0));
                        } else {
                          DocAPI.deleteDir(record.id);
                        }
                      }
                    });
                  }
                },
                items: [
                  {key: '分享', label: '分享'},
                  {key: '移动到', label: '移动到'},
                  {
                    key: '下载Word',
                    label: (
                      <a download href={replaceBaseUrl(`/dream/pen/article/down?id=${record.id}&type=word`)}>
                        下载Word
                      </a>
                    ),
                  },
                  {key: '删除', label: '删除'},
                ],
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
  }, [onRename, onShowDetail]);

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

  const breadcrumb = useMemo(() => {
    const curDir = listSummary.levelPath.pop();
    const arr = listSummary.levelPath.map((item) => ({
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
    if (curDir) {
      arr.push({title: <span>{curDir.folderName}</span>});
    }

    return <Breadcrumb items={arr} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listSummary.levelPath]);

  return (
    <div className={'g-page-content ' + styles.root}>
      <DocumentHead title="我的文档" />
      {/* <EasyEdit
        tpl="你是一名${role}，需要整理本周工作周报，本周主要工作内容为${text}，下周主要工作计划为${newText}"
        option={{
          role: {
            placeholder: '请输入角色',
            data: [
              {label: '管理员', key: '管理员'},
              {label: '普通职员', key: '普通职员'},
            ],
          },
          text: {
            placeholder: '请输入你想表达的意思',
            data: [
              {label: '改了两个bug', key: '改了两个bug'},
              {label: '做了一个新需求', key: '做了一个新需求'},
            ],
          },
        }}
        value={{
          text: '你是一名管理员，需要整理本周工作周报，本周主要工作内容为 ，下周主要工作计划为 ',
          tplValue: [
            {
              key: '你是一名',
              type: 'text',
              value: '你是一名',
            },
            {
              key: 'role',
              type: 'variable',
              value: '管理员',
            },
            {
              key: '，需要整理本周工作周报，本周主要工作内容为',
              type: 'text',
              value: '，需要整理本周工作周报，本周主要工作内容为',
            },
            {
              key: 'text',
              type: 'variable',
              value: ' ',
            },
            {
              key: '，下周主要工作计划为',
              type: 'text',
              value: '，下周主要工作计划为',
            },
            {
              key: 'newText',
              type: 'variable',
              value: ' ',
            },
          ],
        }}
      /> */}
      <div className="hd">{breadcrumb}</div>
      <div className="cd">
        <Space>
          <Button id="_create-doc-btn" loading={loading === 'create'} icon={<PlusOutlined />} onClick={onCreate}>
            起草公文
          </Button>
          {/* <Button icon={<ExceptionOutlined />}>创建模版</Button> */}
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
