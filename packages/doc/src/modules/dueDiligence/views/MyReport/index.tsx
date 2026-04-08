import {ClockCircleOutlined, FileTextOutlined, SearchOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Input, Tooltip} from 'antd';
import {FC, memo, useCallback, useMemo, useState} from 'react';
import LoadingPanel from '@/components/LoadingPanel';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {useDebounceEvent, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import {DueConfigs, ListItem, ListSearch, ListSummary, ReportRecord} from '../../entity';
import styles from './index.module.less';

interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  reportList?: ReportRecord[];
  reportListTotal?: number;
}

const {dueDiligence: dueDiligenceActions} = GetActions('dueDiligence');

const Component: FC<Props> = ({reportList, listSearch, reportListTotal, dispatch}) => {
  const [searchText, setSearchText] = useState<string | undefined>(listSearch.keyWord);

  useMemo(() => {
    setSearchText(listSearch.keyWord);
  }, [listSearch.keyWord]);

  const refreshList = useCallback(() => {
    return dispatch(dueDiligenceActions.fetchReportList());
  }, [dispatch]);

  const onSearch = useDebounceEvent((keyWord: string) => {
    dispatch(dueDiligenceActions.fetchReportList({...listSearch, keyWord, pageCurrent: 1}));
  }, 500);

  const onPreviewReport = useEvent((report: any) => {
    DueDiligenceAPI.viewReportUrl(report.id, report.fileUrl).then((res) => {
      if (res.success && res.data) {
        window.open(res.data);
      }
    });
  });

  const onShowDetail = useEvent((report: any) => {
    if (report.relationId) {
      GetClientRouter().push({url: `/admin/dueDiligence/item/edit/${report.relationId}`}, 'window');
    }
  });

  const formatTitle = (fileName: string) => {
    if (!fileName) return '未命名报告';
    return fileName.replace(/\.[^/.]+$/, '');
  };

  const formatTime = (time?: string) => {
    if (!time) return '未知时间';
    return time.replace('T', ' ').substring(0, 16);
  };

  if (!reportList) {
    return (
      <div className={styles.root}>
        <LoadingPanel />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <DocumentHead title={'我的报告-' + SiteInfo.name} />
      <div className="hd">
        <h1>我的报告</h1>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Input
            className="search-input"
            placeholder="请搜索报告关键词"
            allowClear
            value={searchText}
            onChange={(e) => {
              const val = e.target.value;
              setSearchText(val);
              onSearch(val);
            }}
            onPressEnter={() => onSearch(searchText || '')}
            suffix={<SearchOutlined onClick={() => onSearch(searchText || '')} />}
          />
        </div>
      </div>
      <div className="bd">
        {reportList.length === 0 ? (
          <div className={styles.empty}>
            <img src={require('@/assets/imgs/null.png')} alt="暂无报告内容" />
            <p>暂无相关报告内容</p>
          </div>
        ) : (
          <div className={styles.list}>
            {reportList.map((item) => (
              <div className={styles.card} key={item.id}>
                <div className="bd">
                  <div className={styles.iconBox}>
                    <FileTextOutlined style={{fontSize: 32, color: '#4f46e5'}} />
                  </div>
                  <div className="title">
                    <Tooltip title={item.fileName} placement="topLeft" mouseEnterDelay={0.5}>
                      <span className="name-text">{formatTitle(item.fileName)}</span>
                    </Tooltip>
                  </div>
                  <Tooltip title={item.dealSummary || '访谈小总结未生成，请刷新生成。'} placement="bottomLeft">
                    <div className="ft">{item.dealSummary || '访谈小总结未生成，请刷新生成。'}</div>
                  </Tooltip>
                  <div className={styles.footer}>
                    <div className={styles.time}>
                      <ClockCircleOutlined style={{marginRight: 6}} />
                      {formatTime(item.fileCreateFinishTime || item.lastModifiedTime)}
                    </div>
                    <div className={styles.actions}>
                      <Button type="link" size="small" onClick={() => onPreviewReport(item)} style={{padding: 0}}>
                        预览报告
                      </Button>
                      <Button type="link" size="small" onClick={() => onShowDetail(item)} style={{padding: 0, marginLeft: 16}}>
                        查看详情
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Component);
