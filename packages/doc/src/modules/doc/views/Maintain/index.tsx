import {
  DeleteOutlined,
  DownOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SignatureOutlined,
  StarFilled,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {Dispatch, DocumentHead, Link, setLoading as setGlobalLoading} from '@elux/react-web';
import {Breadcrumb, Button, Dropdown, Input, Popover, Space, Table, TableProps, Tree, Upload, UploadProps} from 'antd';
import {FC, MouseEvent, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {downloadFile, getUploadProps, replaceBaseUrl} from '@/utils/request';
import {confirm, debounce, openArticle, useEvent} from '@/utils/tools';
import {DocAPI} from '../../api';
import {DocType, ListItem, ListSearch, ListSummary, TplsOptions} from '../../entity';
import Preview from '../Preview';
import Wizard, {WizardFormData} from '../Wizard';
import styles from './index.module.less';
interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const {doc: docActions} = GetActions('doc');

const Component: FC<Props> = ({list, listSearch, listSummary, dispatch}) => {
  const [loading, setLoading] = useState<'create' | 'createDir' | 'createByTpl' | 'upload' | 'batchDelete' | ''>('');
  const [selectedRows, setSelectedRows] = useState<{ids: string[]; rows: ListItem[]}>({ids: [], rows: []});
  const [scrollHeight, setScrollHeight] = useState(() => window.innerHeight - 285);
  const [showRename, setShowRename] = useState('');
  const [showMove, setShowMove] = useState('');
  const [wizardData, setWizardData] = useState<WizardFormData>();
  const [tplsOptions, setTplsOptions] = useState<TplsOptions>();
  const [previewTpl, setPreviewTpl] = useState<string>();

  const refreshList = useCallback(() => {
    return dispatch(docActions.fetchList());
  }, [dispatch]);

  const onShowDetail = useEvent((evt: MouseEvent, id: string, type: DocType) => {
    if (type === 'doc') {
      openArticle(`/admin/doc/item/edit/${id}?__c=_dialog`);
      //GetClientRouter().push({url: `/admin/doc/item/edit/${id}?__c=_dialog`}, singleWindow);
    } else {
      GetClientRouter().push({url: `/admin/doc/list/maintain?id=${id}`}, 'page');
    }
  });

  const onRename = useEvent((id: string, type: DocType, name: string) => {
    if (type === 'doc') {
      DocAPI.updateDocName(id, name, type).then(refreshList);
    } else {
      DocAPI.updateDirName(id, name, type).then(refreshList);
    }
    setShowRename('');
  });

  const onMove = useEvent((id: string, type: DocType, target: string) => {
    DocAPI.moveItem(id, type, target).then(refreshList);
    setShowMove('');
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
            <a className={'ico-' + row.type} title={text} onClick={(e) => onShowDetail(e, row.id, row.type)}>
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
          return row.type === 'doc' ? `${num}字` : '';
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
        sorter: true,
        sortOrder: (listSearch.sorterField === 'updateDate' && listSearch.sorterOrder) || null,
        width: 180,
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
            <Popover
              trigger="click"
              destroyTooltipOnHide
              open={showMove === record.id}
              onOpenChange={(open) => {
                setShowMove(open ? record.id : '');
              }}
              content={
                <Tree
                  className={styles.move}
                  showIcon
                  icon={<FolderOpenOutlined />}
                  defaultExpandedKeys={[listSearch.id || '0']}
                  defaultSelectedKeys={[listSearch.id || '0']}
                  treeData={listSummary.dirTree}
                  onSelect={(selected) => onMove(record.id, record.type, selected[0] as string)}
                />
              }
            >
              <a>移动到</a>
            </Popover>
            {record.type === 'doc' && <a onClick={() => DocAPI.copyItem(record.id, record.type).then(refreshList)}>复制</a>}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRename, showMove, listSearch, listSummary]);

  const onCreate = useEvent(
    (title: string = '', data: string | [string, number] = '', tpl?: {id: string; fields: {[field: string]: string}; knowledges?: string[]}) => {
      setLoading('create');
      let contents = '';
      let count = 0;
      if (typeof data === 'string') {
        contents = data;
      } else {
        contents = data[0];
        count = data[1];
      }
      DocAPI.createDoc({folder: listSearch.id || '0', title, contents}, 'doc', count)
        .then(async ({id}) => {
          setSelectedRows({ids: [], rows: []});
          await refreshList();
          if (tpl) {
            window.sessionStorage.setItem('__temp_tpl__', JSON.stringify(tpl));
            openArticle(`/admin/doc/item/edit/${id}?&tpl=${tpl.id}&__c=_dialog`);
          } else if (!title) {
            openArticle(`/admin/doc/item/edit/${id}?__c=_dialog`);
          }
        })
        .finally(() => setLoading(''));
    }
  );

  const onCreateDir = useEvent(() => {
    setLoading('createDir');
    DocAPI.createDir({folder: listSearch.id || '0'}, 'doc')
      .then(() => {
        setSelectedRows({ids: [], rows: []});
        refreshList();
      })
      .finally(() => setLoading(''));
  });

  const batchDelete = useEvent(() => {
    confirm(`您确定要删除所有选择的文档吗？`, (ok) => {
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

  const onCreateByTpl = useEvent(async () => {
    let options = tplsOptions;
    if (!options) {
      options = await DocAPI.getTplsOptions();
      setTplsOptions(options);
    }
    return setWizardData({type: options[0].value, tplId: options[0].children[0].value});
  });

  const onWizardSubmit = useEvent((tplId: string, fields: {[field: string]: string}, knowledges: string[]) => {
    setWizardData(undefined);
    DocAPI.getDoc(tplId).then((tpl) => {
      onCreate(tpl.title, '', {id: tplId, fields, knowledges});
    });
  });

  const uploadProps: UploadProps = useMemo(
    () =>
      getUploadProps('/dream/pen/article/upload', {
        onProcess: () => setLoading('upload'),
        onSuccess: (file, res) => {
          setLoading('');
          onCreate(res.title, [res.html.replace(/^<div[^>]+>(.+?)<\/div>$/, '$1'), res.articleCount]);
        },
        onError: () => setLoading(''),
      }),
    [onCreate]
  );

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

  const breadcrumb = useMemo(() => {
    const curDir = listSummary.levelPath.pop();
    if (curDir) {
      const arr = listSummary.levelPath.map((item) => ({
        title: (
          <Link to={`/admin/doc/list/maintain?id=${item.id}`} action="push" target="page">
            {item.folderName}
          </Link>
        ),
      }));
      arr.unshift({
        title: (
          <Link to="/admin/doc/list/maintain" action="push" target="page">
            我的文档
          </Link>
        ),
      });
      arr.push({title: <span>{curDir.folderName}</span>});
      return <Breadcrumb items={arr} />;
    } else {
      return <span className="ant-breadcrumb">我的文档</span>;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listSummary.levelPath]);

  const onTableChange = useEvent((pagination: any, filter: any, _sorter: any) => {
    const sorter = _sorter as {field: string; order: 'ascend' | 'descend' | undefined};
    const sorterField = (sorter.order && sorter.field) || undefined;
    const sorterOrder = sorter.order || undefined;
    return dispatch(docActions.fetchList({...listSearch, sorterField, sorterOrder}));
  });

  useEffect(() => {
    const onResize = debounce(() => setScrollHeight(window.innerHeight - 285), 300);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.root}>
      <DocumentHead title={'我的文档-' + SiteInfo.name} />
      <div className="hd">
        {breadcrumb}
        <Input.Search allowClear className="search" placeholder="请输入搜索关键字..." onSearch={onSearch} />
      </div>
      <div className="cd">
        <Space>
          <Button icon={<SignatureOutlined />} onClick={onCreateByTpl}>
            起草公文
          </Button>
          <Button id="_create-doc-btn" loading={loading === 'create'} icon={<PlusOutlined />} onClick={() => onCreate()}>
            快速创建
          </Button>
          {/* <Button icon={<ExceptionOutlined />}>创建模版</Button> */}
          <Button loading={loading === 'createDir'} icon={<FolderAddOutlined />} onClick={onCreateDir}>
            新建文件夹
          </Button>
          <Upload showUploadList={false} accept=".docx" {...uploadProps}>
            <Button loading={loading === 'upload'} icon={<UploadOutlined />}>
              上传文档
            </Button>
          </Upload>
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
      {previewTpl && <Preview tplId={previewTpl} onCancel={() => setPreviewTpl(undefined)} />}
      {wizardData && (
        <Wizard
          tplsOptions={tplsOptions}
          data={wizardData}
          onCancel={() => setWizardData(undefined)}
          onSubmit={onWizardSubmit}
          onPriview={setPreviewTpl}
        />
      )}
    </div>
  );
};

export default memo(Component);
