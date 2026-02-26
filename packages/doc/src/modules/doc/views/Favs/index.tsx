import {DeleteOutlined, DownOutlined, StarFilled} from '@ant-design/icons';
import {Dispatch, DocumentHead, setLoading as setGlobalLoading} from '@elux/react-web';
import {Button, Dropdown, Input, Modal, Popover, Space, Table, TableProps} from 'antd';
import {FC, MouseEvent, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {downloadFile, replaceBaseUrl} from '@/utils/request';
import {confirm, debounce, openArticle, showMask, useEvent} from '@/utils/tools';
import {DocAPI} from '../../api';
import {DocType, ListItem, ListSearch, ListSummary} from '../../entity';
import styles from '../Maintain/index.module.less';
import Preview from '../Preview';
import Wizard, {WizardFormData} from '../Wizard';
interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const {doc: docActions} = GetActions('doc');

const Component: FC<Props> = ({list, listSearch, listSummary, dispatch}) => {
  const [loading, setLoading] = useState<'create' | 'createDir' | 'upload' | 'batchDelete' | ''>('');
  const [selectedRows, setSelectedRows] = useState<{ids: string[]; rows: ListItem[]}>({ids: [], rows: []});
  const [scrollHeight, setScrollHeight] = useState(() => window.innerHeight - 165);
  const [showRename, setShowRename] = useState('');
  const [wizardData, setWizardData] = useState<WizardFormData>();
  const [previewTpl, setPreviewTpl] = useState<ListItem>();

  const refreshList = useCallback(() => {
    return dispatch(docActions.fetchList());
  }, [dispatch]);

  const onShowDetail = useEvent((evt: MouseEvent, id: string, type: DocType, title: string) => {
    if (type === 'doc' || type === 'con') {
      openArticle(`/admin/doc/item/edit/${id}?__c=_dialog`, title);
    } else if (type === 'tpl') {
      openArticle(`/admin/doc/item/tpl/${id}?__c=_dialog`, title);
    } else {
      GetClientRouter().push({url: `/admin/doc/list/maintain?id=${id}`}, 'page');
    }
  });

  const onRename = useEvent((id: string, type: DocType, name: string) => {
    if (type !== 'dir') {
      DocAPI.updateDocName(id, name, type).then(refreshList);
    } else {
      DocAPI.updateDirName(id, name, type).then(refreshList);
    }
    setShowRename('');
  });

  const onSearch = useEvent((name: string) => {
    dispatch(docActions.fetchList({...listSearch, name}));
  });

  const onCreateByTpl = useEvent((tplId: string, fields?: {[field: string]: string}, knowledges?: string[], stand?: string, isContract?: boolean) => {
    DocAPI.getDoc(tplId).then((tpl) => {
      if (tpl.format === '2') {
        alert('生成word文档');
      } else {
        DocAPI.createDoc({folder: isContract ? '1' : '0', title: tpl.title, contents: ''}, 'doc').then(async ({id, title}) => {
          const data = {id: tplId, fields, knowledges, stand};
          console.log(data);
          window.sessionStorage.setItem('__temp_tpl__', JSON.stringify(data));
          openArticle(`/admin/doc/item/edit/${id}?&tpl=${tpl.id}&__c=_dialog`, title);
        });
      }
    });
  });

  const onWizardSubmit = useEvent((tplId: string, fields: {[field: string]: string}, knowledges: string[], stand?: string, isContract?: boolean) => {
    setWizardData(undefined);
    onCreateByTpl(tplId, fields, knowledges, stand, isContract);
  });

  const columns = useMemo<TableProps<ListItem>['columns']>(() => {
    return [
      {
        title: '名称',
        dataIndex: 'title',
        key: 'title',
        render: (text, row) => (
          <div className="file-name">
            <a className={'ico-' + row.type} title={text} onClick={(e) => onShowDetail(e, row.id, row.type, row.title)}>
              {text}
            </a>
            <StarFilled onClick={() => DocAPI.collectItem(row.id, row.type, !row.collect).then(refreshList)} />
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
        width: 260,
        render: (_: any, record) => (
          <Space size="middle">
            <Popover
              trigger="click"
              destroyOnHidden
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
            {record.type === 'tpl' && <a onClick={() => setPreviewTpl(record)}>预览</a>}
            {record.type === 'tpl' && <a onClick={() => onApplyTpl(record.id, record.isContract)}>使用模版</a>}
            {(record.type === 'doc' || record.type === 'con') && (
              <Dropdown
                menu={{
                  onClick: ({key}: {key: string}) => {
                    if (key === '下载Word') {
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
                  items: [
                    {
                      key: '下载Word',
                      label: '下载Word',
                    },
                    {
                      key: '下载PDF',
                      label: '下载PDF',
                    },
                  ],
                }}
              >
                <a>
                  下载 <DownOutlined style={{fontSize: 12}} />
                </a>
              </Dropdown>
            )}
          </Space>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRename, listSearch, listSummary]);

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

  const onApplyTpl = useEvent((tplId: string, isContract?: boolean) => {
    DocAPI.getTplFields(tplId).then((fields) => {
      setWizardData({tplId, fields, isContract});
    });
  });

  useEffect(() => {
    const onResize = debounce(() => setScrollHeight(window.innerHeight - 165), 300);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.root}>
      <DocumentHead title={'我的收藏-' + SiteInfo.name} />
      <div className="hd">
        <span className="ant-breadcrumb">我的收藏</span>
        <Input.Search allowClear className="search" placeholder="请输入搜索关键字..." onSearch={onSearch} />
      </div>
      <div className="cd">
        <Space></Space>
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
      {wizardData && <Wizard data={wizardData} onCancel={() => setWizardData(undefined)} onSubmit={onWizardSubmit} />}
      {previewTpl && (
        <Preview tplId={previewTpl.id} onCancel={() => setPreviewTpl(undefined)} onApply={() => onApplyTpl(previewTpl.id, previewTpl.isContract)} />
      )}
    </div>
  );
};

export default memo(Component);
