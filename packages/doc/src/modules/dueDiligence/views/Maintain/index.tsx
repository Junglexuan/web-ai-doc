import {DeleteOutlined, EditOutlined, EllipsisOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Dropdown, Input, Modal, Tooltip} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import LoadingPanel from '@/components/LoadingPanel';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {confirm, showMask, useEvent, useThrottleEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import Icons from '../../components/IconSelect/icons';
import {DueConfigs, ListItem, ListSearch, ListSummary, StatusMap} from '../../entity';
import Edit from '../Edit';
import styles from './index.module.less';

interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const {dueDiligence: dueDiligenceActions} = GetActions('dueDiligence');

const Component: FC<Props> = ({list, listSearch, listSummary, dispatch}) => {
  const [searchText, setSearchText] = useState<string | undefined>(listSearch.keyWord);
  const [curEdit, setCurEdit] = useState<Partial<ListItem>>();
  const [configs, setConfigs] = useState<DueConfigs>();

  useMemo(() => {
    setSearchText(listSearch.keyWord);
  }, [listSearch.keyWord]);

  const refreshList = useCallback(() => {
    return dispatch(dueDiligenceActions.fetchList());
  }, [dispatch]);

  const onCreate = useThrottleEvent(() => {
    if (!configs) return;
    const {autoCreateFinalSheets, questions, template} = configs;
    const initialQuestionId = template.selected.questionId || questions.selected;
    setCurEdit({
      id: '',
      name: '',
      logo: '',
      pathList: [],
      questions: {
        tpl: String(initialQuestionId),
        list: questions.tpls.find((item) => String(item.value) === String(initialQuestionId))?.list || [],
      },
      template: template.selected,
      autoCreateFinalSheets,
    });
  });

  const onShowDetail = useThrottleEvent((data: ListItem) => {
    GetClientRouter().push({url: `/admin/dueDiligence/item/edit/${data.id}`}, 'window');
  });

  const onEdit = useThrottleEvent((data: ListItem) => {
    if (!configs) return;
    const {autoCreateFinalSheets, questions, template} = configs;

    // 根据 data 中的 ID 查找对应的名称或列表，如果找不到则使用当前配置中的默认值
    const selectedTemplate = template.list.find((t) => String(t.id) === String(data.templateId));
    const selectedQuestionId = data.questionId || selectedTemplate?.questionId || questions.selected;
    const selectedQuestionList = questions.tpls.find((q) => String(q.value) === String(selectedQuestionId))?.list || [];

    // 对于编辑操作，保留原有的信息
    showMask(true);
    setCurEdit({
      id: data.id,
      name: data.name,
      logo: data.logo,
      pathList: data.pathList,
      questions: {
        tpl: String(selectedQuestionId),
        list: selectedQuestionList,
      },
      template: {
        id: data.templateId || template.selected.id,
        name: selectedTemplate?.title || template.selected.name,
      },
      autoCreateFinalSheets: data.autoCreateFinalSheets ?? autoCreateFinalSheets,
    });
  });

  const onCloseEdit = useEvent(() => {
    showMask(false);
    setCurEdit(undefined);
  });

  const onEditSubmit = useThrottleEvent((data: ListItem) => {
    console.log('data: onEditSubmit=', data);
    const formData = {...curEdit, ...data};

    // 如果在表单中更改了 templateId，则确保同步更新 questionId
    if (data.templateId) {
      const selectedTpl = configs?.template.list.find((t) => String(t.id) === String(data.templateId));
      if (selectedTpl?.questionId) {
        formData.questionId = String(selectedTpl.questionId);
        if (formData.questions) {
          formData.questions.tpl = String(selectedTpl.questionId);
        }
      }
    }

    console.log('formData: ', formData);
    DueDiligenceAPI.createItem(formData).then((item) => {
      setCurEdit(undefined);
      refreshList();
      !formData.id && onShowDetail(item);
    });
  });

  const onDelete = useThrottleEvent((id: string) => {
    confirm(
      `确认删除尽调吗？删除后该尽调的所有信息将被删除，无法恢复！`,
      (ok) => {
        if (ok) {
          DueDiligenceAPI.deleteItem(id).then(refreshList);
        }
      },
      {title: '删除尽调'}
    );
  });

  const onSearch = useThrottleEvent((keyWord: string) => {
    dispatch(dueDiligenceActions.fetchList({...listSearch, keyWord}));
  });

  const onTab = useThrottleEvent((status: 'start' | 'end') => {
    GetClientRouter().push({url: `/admin/dueDiligence/list/maintain?status=${status}`}, 'window');
  });

  useEffect(() => {
    DueDiligenceAPI.getConfigs().then(setConfigs);
  }, []);

  if (!configs) {
    return (
      <div className={styles.root}>
        <LoadingPanel />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <DocumentHead title={'尽调管理-' + SiteInfo.name} />
      <div className="hd">
        <h1>尽调管理</h1>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Input
            className="search-input"
            placeholder="搜索尽调项目名称..."
            prefix={<SearchOutlined style={{color: '#8c8c8c'}} />}
            value={searchText}
            onChange={(e) => {
              const val = e.target.value;
              setSearchText(val);
              onSearch(val);
            }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} style={{borderRadius: 10, fontWeight: 500}}>
            新建尽调
          </Button>
        </div>
      </div>
      <div className="cd">
        <div className={listSearch.status !== 'end' ? 'active' : ''} onClick={() => onTab('start')}>
          进行中
        </div>
        <div className={listSearch.status === 'end' ? 'active' : ''} onClick={() => onTab('end')}>
          已归档
        </div>
      </div>
      <div className="bd">
        {list.length === 0 ? (
          <div className={styles.empty}>
            <img src={require('@/assets/imgs/null.png')} alt="暂无尽调内容" />
            <p>暂无尽调内容</p>
          </div>
        ) : (
          <div className={styles.list}>
            {list.map((item) => {
              return (
                <div className={styles.card} key={item.id} onClick={() => onShowDetail(item)}>
                  <div className="bd">
                    <img className="icon" src={item.logo || Icons[0]} />
                    <div className="title">
                      {item.name}
                      <Dropdown
                        menu={{
                          items: [
                            listSearch.status !== 'end' && {
                              key: 'edit',
                              label: (
                                <div>
                                  <EditOutlined style={{marginRight: 8}} />
                                  编辑尽调
                                </div>
                              ),
                              onClick: (e: any) => {
                                e.domEvent.stopPropagation();
                                onEdit(item);
                              },
                            },
                            {
                              key: 'delete',
                              label: (
                                <div>
                                  <DeleteOutlined style={{marginRight: 8}} />
                                  删除尽调
                                </div>
                              ),
                              onClick: (e: any) => {
                                e.domEvent.stopPropagation();
                                onDelete(item.id);
                              },
                            },
                          ].filter(Boolean) as any,
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <EllipsisOutlined className={styles.moreActions} onClick={(e) => e.stopPropagation()} />
                      </Dropdown>
                    </div>
                    <Tooltip title={item.dealSummary || '访谈小总结未生成，请刷新生成。'} placement="bottomLeft">
                      <div className="ft">{item.dealSummary || '访谈小总结未生成，请刷新生成。'}</div>
                    </Tooltip>
                    {item.updateDate && (
                      <div className={styles.time}>
                        {listSearch.status === 'end' ? '归档时间' : '更新时间'}：{item.updateDate}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Modal
        width={590}
        title={curEdit?.id ? '编辑尽调' : '新建尽调'}
        open={!!curEdit}
        footer={null}
        destroyOnClose
        onCancel={() => {
          onCloseEdit();
        }}
        afterOpenChange={(open: boolean) => {
          showMask(open);
        }}
      >
        <Edit
          configs={configs!}
          data={curEdit || {}}
          onCancel={() => {
            onCloseEdit();
          }}
          onSubmit={onEditSubmit}
        />
      </Modal>
    </div>
  );
};

export default memo(Component);
