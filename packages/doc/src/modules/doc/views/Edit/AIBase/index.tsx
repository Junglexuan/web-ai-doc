import {CheckOutlined, DeleteOutlined, EditOutlined, PauseCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {RenderChart} from '@binarysee/widgets';
import {Button, Space, Spin} from 'antd';
import {FC, ReactElement, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AdjustIcon from '@/assets/images/Adjust';
import {useEvent} from '@/utils/tools';
import {AIAction} from '../api';
import ChartBISelect from '../ChartBISelect';
import ColorAIcon from '../ColorAIcon';
import EnterIcon from '../EnterIcon';
import {AIDialogHooks} from '../hooks';
import KnowledgeSelect from '../KnowledgeSelect';
import ModelSelect from '../ModelSelect';
import RobotSelect from '../RobotSelect';
import styles from './index.module.less';

interface Props {
  title: string;
  action: string;
  children: ReactElement;
  hooks: AIDialogHooks;
  automatic?: boolean;
  className?: string;
}

const Component: FC<Props> = ({title, action, children, hooks, automatic, className}) => {
  const {
    onPromptSubmit,
    inputRef,
    model,
    fragment,
    fragmentRef,
    runningState,
    insertLoading,
    onRedo,
    onKeep,
    onStop,
    onInsert,
    onAdjust,
    onModelChange,
    onKnowledgeChange,
  } = hooks;

  const submitRef = useRef<any>();
  const stopRef = useRef<any>();
  const [chartData, setChartData] = useState<any>();

  const onFragmentClick = useCallback((e: any) => {
    const target = e.target as HTMLElement;
    const img = target.getAttribute('data-img');
    if (img && target.parentNode?.nodeName === 'FIGURE') {
      target.className = target.className ? '' : 'on';
    }
  }, []);

  useMemo(() => {
    const data = action === AIAction.SJZNT && fragment ? JSON.parse(fragment) : null;
    setChartData(data);
  }, [action, fragment]);

  const onPaginationChange = useEvent((page: number, pageSize: number) => {
    const visual = chartData.visual;
    const indicatorModelSql = chartData.indicatorModelSql;
    if (!visual) {
      return;
    }
    //  接口URL : `/brain/chatbi/0/widget/page`
    // chatbiTablePagenationApi({
    //   pageNum: page,
    //   pageSize,
    //   robotId,
    //   ...visual,
    //   indicatorModelSql,
    // }).then((res) => {

    // });
  });

  useEffect(() => {
    if (automatic) {
      onPromptSubmit();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (runningState === 'Fulfilled') {
      setTimeout(() => {
        submitRef.current.focus();
      });
    } else if (runningState === 'Pending') {
      setTimeout(() => {
        stopRef.current.focus();
      });
    }
  }, [runningState]);

  return (
    <div id="_ai_dialog" className={styles.common + ' ' + runningState}>
      <ColorAIcon />
      <div className="input">
        <EnterIcon onClick={onPromptSubmit} />
        {children}
      </div>
      <div className={'result' + (className ? ` ${className}` : '')}>
        <Spin className="loading" size="small" />
        <div className="title">{inputRef.current?.getValue() || title}...</div>
        <Button size="small" className="pause-btn" type="text" icon={<PauseCircleOutlined />} ref={stopRef} onClick={onStop}>
          停止
        </Button>
        {chartData ? (
          <div className="article" ref={fragmentRef as any}>
            <RenderChart onPaginationChange={onPaginationChange} chartDsl={chartData.dsl} />
          </div>
        ) : (
          <div className="article" ref={fragmentRef as any} dangerouslySetInnerHTML={{__html: fragment}} onClick={onFragmentClick}></div>
        )}
      </div>
      <div className="footer">
        <Space size="small" className="actions">
          <Button type="primary" icon={<CheckOutlined />} onClick={onInsert} loading={insertLoading} ref={submitRef}>
            插入
          </Button>
          <Button type="text" icon={<SyncOutlined />} onClick={onRedo}>
            重新生成
          </Button>
          {action !== AIAction.SCTP && action !== AIAction.WYZJ && action !== AIAction.SJZNT && (
            <Button type="text" icon={<EditOutlined />} onClick={onKeep}>
              继续写
            </Button>
          )}
          <Button type="text" icon={<AdjustIcon />} onClick={onAdjust}>
            换一换
          </Button>
          <Button type="text" icon={<DeleteOutlined />} onClick={() => hooks.aiRef.closeMenu(true)}>
            弃用
          </Button>
        </Space>
        <div className="prompt">
          {action !== AIAction.SCTP && (
            <>
              {action === AIAction.ZSKWD ? (
                <RobotSelect size="small" value={model} onChange={onModelChange} />
              ) : action === AIAction.SJZNT ? (
                <ChartBISelect size="small" value={model} onChange={onModelChange} />
              ) : (
                <ModelSelect size="small" value={model} onChange={onModelChange} />
              )}
              {action === AIAction.SCQW && <KnowledgeSelect size="small" onChange={onKnowledgeChange} />}
            </>
          )}
          <div style={{color: '#aaa', fontSize: '12px'}}>* 回车直接提交，shift+回车可换行，esc键可关闭</div>
        </div>
      </div>
    </div>
  );
};

export default memo(Component);
