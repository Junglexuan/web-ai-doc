import {PlusOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Input, Modal} from 'antd';
import {Progress} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import LoadingPanel from '@/components/LoadingPanel';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {confirm, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import {DueConfigs, ListItem, ListSearch, ListSummary} from '../../entity';
import Edit from '../Edit';
import styles from './index.module.less';
import type {ProgressProps} from 'antd';

// const fileLists = [
//   {
//     uid: '-1',
//     name: '是大方大事发生大方阿瑟费的萨芬俄方是大方是大方大事发生大方阿瑟费的萨芬俄方是大方.png',
//     status: 'done',
//     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
//   },
//   {
//     uid: '-2',
//     name: 'image.png',
//     status: 'done',
//     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
//   },
//   {
//     uid: '-3',
//     name: 'image.png',
//     status: 'done',
//     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
//   },
// ];
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
  const [curEdit, setCurEdit] = useState<ListItem>();
  const [configs, setConfigs] = useState<DueConfigs>();

  useMemo(() => {
    setSearchText(listSearch.keyWord);
  }, [listSearch.keyWord]);

  const refreshList = useCallback(() => {
    return dispatch(dueDiligenceActions.fetchList());
  }, [dispatch]);

  const onCreate = useEvent(() => {
    const {autoCreateFinalSheets, questions, template} = configs!;
    setCurEdit({
      id: '',
      name: '',
      logo: 'aaa.png',
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

  const onCloseEdit = useEvent(() => {
    setCurEdit(undefined);
  });

  const onEditSubmit = useEvent((data: ListItem) => {
    console.log(data);
    DueDiligenceAPI.createItem(data).then(() => {
      setCurEdit(undefined);
      refreshList();
    });
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
          已完成
        </div>
      </div>
      <div className="bd">
        <div className={styles.list}>
          {list.map((item) => {
            return (
              <div className={styles.card} key={item.id} onClick={() => onShowDetail(item)}>
                <div className="bd">
                  <div className="status">完善中</div>
                  <div className="icon"></div>
                  <div className="title">B公司流贷尽调</div>
                  <div className="desc">已记录与B公司CEO的访谈，建议您上传公司财务报表等资料进行补充。</div>
                </div>
                <div className="ft">
                  <div>完成进度</div>
                  <Progress percent={60} strokeColor={twoColors} size={{height: 10}} showInfo={false} />
                  <span>50%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {curEdit && (
        <Modal width={590} title={curEdit.id ? '修改尽调' : '新建尽调'} open={true} footer={null} onCancel={onCloseEdit}>
          <Edit configs={configs} data={curEdit} onCancel={onCloseEdit} onSubmit={onEditSubmit} />
        </Modal>
      )}
    </div>
  );
};

export default memo(Component);
