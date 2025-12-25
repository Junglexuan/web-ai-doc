import {DeleteOutlined, EditOutlined, EllipsisOutlined, PlusOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Dropdown, Input, Modal} from 'antd';
import {Progress} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import LoadingPanel from '@/components/LoadingPanel';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {confirm, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import Icons from '../../components/IconSelect/icons';
import {DueConfigs, ListItem, ListSearch, ListSummary, StatusMap} from '../../entity';
import Edit, {IconItem} from '../Edit';
import styles from './index.module.less';
import type {ProgressProps} from 'antd';

const twoColors: ProgressProps['strokeColor'] = {
  '0%': '#6C47EF',
  '100%': '#1B68FC',
};
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
  const [lastSelectedIconIndex, setLastSelectedIconIndex] = useState<number>(-1);

  useMemo(() => {
    setSearchText(listSearch.keyWord);
  }, [listSearch.keyWord]);

  const refreshList = useCallback(() => {
    return dispatch(dueDiligenceActions.fetchList());
  }, [dispatch]);

  const agentIcons = useMemo((): IconItem[] => {
    return Array.from({length: 5}, (_, index) => ({
      id: index + 1,
      path: require(`@/assets/agent/${index + 1}.png`),
      relativePath: `agent/${index + 1}.png`,
    }));
  }, []);

  const onCreate = useEvent(() => {
    const {autoCreateFinalSheets, questions, template} = configs!;

    // 计算下一个图标索引（循环到第一个）
    const nextIndex = (lastSelectedIconIndex + 1) % agentIcons.length;

    // 更新状态
    setLastSelectedIconIndex(nextIndex);

    setCurEdit({
      id: '',
      name: '',
      logo: agentIcons[nextIndex].relativePath,
      pathList: [],
      questions: {
        tpl: questions.selected,
        list: questions.tpls.find((item) => item.value === questions.selected)?.list || [],
      },
      template: template.selected,
      autoCreateFinalSheets,
    });
  });

  const onShowDetail = useEvent((data: ListItem) => {
    GetClientRouter().push({url: `/admin/dueDiligence/item/edit/${data.id}`}, 'window');
  });

  const onEdit = useEvent((data: ListItem) => {
    const {autoCreateFinalSheets, questions, template} = configs!;

    // 对于编辑操作，保留原有的logo值
    setCurEdit({
      id: data.id,
      name: data.name,
      logo: data.logo,
      pathList: data.pathList,
      questions: {
        tpl: questions.selected,
        list: questions.tpls.find((item) => item.value === questions.selected)?.list || [],
      },
      template: template.selected,
      autoCreateFinalSheets,
    });
  });

  const onCloseEdit = useEvent(() => {
    setCurEdit(undefined);
  });

  const onEditSubmit = useEvent((data: ListItem) => {
    console.log('data: onEditSubmit=', data);
    const formData = {...curEdit, ...data};

    // 根据是否有id来区分是编辑还是新建
    if (curEdit?.id) {
      // 编辑操作
      DueDiligenceAPI.updateItem(curEdit.id, formData).then(() => {
        setCurEdit(undefined);
        refreshList();
      });
    } else {
      // 新建操作
      DueDiligenceAPI.createItem(formData).then((item) => {
        setCurEdit(undefined);
        refreshList();
        onShowDetail(item);
      });
    }
  });

  const onDelete = useEvent((id: string) => {
    confirm(`您确定要删除吗？删除后不可恢复！`, (ok) => {
      if (ok) {
        DueDiligenceAPI.deleteItem(id).then(refreshList);
      }
    });
  });

  const onSearch = useEvent((keyWord: string) => {
    dispatch(dueDiligenceActions.fetchList({...listSearch, keyWord}));
  });

  const onTab = useEvent((status: 'start' | 'end') => {
    dispatch(dueDiligenceActions.fetchList({status, keyWord: undefined}));
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
        <div>
          <Input.Search
            allowClear
            value={searchText}
            className="search"
            placeholder="请输入搜索关键字..."
            onChange={(e) => setSearchText(e.target.value.trim())}
            onSearch={onSearch}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
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
        <div className={styles.list}>
          {list.map((item) => {
            return (
              <div className={styles.card} key={item.id}>
                {/* <div className="status">{StatusMap[item.status]}</div> */}
                <div className="bd">
                  <img className="icon" src={item.logo || Icons[0]} />
                  <div className="title" onClick={() => onShowDetail(item)}>
                    {item.name}
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            label: (
                              <div>
                                <EditOutlined style={{marginRight: 8}} />
                                编辑信息
                              </div>
                            ),
                            onClick: (e) => {
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
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              onDelete(item.id);
                            },
                          },
                        ],
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <EllipsisOutlined className={styles.moreActions} onClick={(e) => e.stopPropagation()} />
                    </Dropdown>
                  </div>
                  {/* <div className="desc">{item.desc}</div> */}
                  <div className="ft">
                    <div>完成进度</div>
                    <Progress percent={item.progress} strokeColor={twoColors} size={{height: 10}} showInfo={false} />
                    <span>{`${item.progress}%`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {curEdit && (
        <Modal width={540} title={curEdit.id ? '修改尽调' : '新建尽调'} open={true} footer={null} onCancel={onCloseEdit}>
          <Edit
            configs={configs}
            data={curEdit}
            lastSelectedIconIndex={lastSelectedIconIndex}
            onIconSelect={setLastSelectedIconIndex}
            onCancel={onCloseEdit}
            onSubmit={onEditSubmit}
          />
        </Modal>
      )}
    </div>
  );
};

export default memo(Component);
