import {CheckOutlined, DeleteOutlined, EditOutlined, PauseCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {Button, Space, Spin} from 'antd';
import {FC, ReactElement, memo, useCallback, useEffect, useMemo, useRef} from 'react';
import AdjustIcon from '@/assets/images/Adjust';
import {AIAction} from '../api';
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
  modelIsRobot?: boolean;
  hideButton?: Array<'onKeep' | 'selectModel'>;
  className?: string;
}

const Component: FC<Props> = ({title, action, children, hooks, automatic, hideButton, modelIsRobot, className}) => {
  const {
    onPromptSubmit,
    inputRef,
    model,
    fragment,
    fragmentRef,
    runningState,
    onRedo,
    onKeep,
    onStop,
    onInsert,
    onAdjust,
    onModelChange,
    onKnowledgeChange,
  } = hooks;
  const hideButtonMap: {[key: string]: boolean} = useMemo(() => {
    if (hideButton) {
      return hideButton.reduce((obj, cur) => {
        obj[cur] = true;
        return obj;
      }, {} as {[key: string]: boolean});
    } else {
      return {};
    }
  }, [hideButton]);

  const submitRef = useRef<any>();
  const stopRef = useRef<any>();

  const onFragmentClick = useCallback((e: any) => {
    const target = e.target as HTMLElement;
    const img = target.getAttribute('data-img');
    if (img && target.parentNode?.nodeName === 'FIGURE') {
      target.className = target.className ? '' : 'on';
    }
  }, []);

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
        <div className="article" ref={fragmentRef as any} dangerouslySetInnerHTML={{__html: fragment}} onClick={onFragmentClick}></div>
      </div>
      <div className="footer">
        <Space size="small" className="actions">
          <Button type="primary" icon={<CheckOutlined />} onClick={onInsert} ref={submitRef}>
            插入
          </Button>
          <Button type="text" icon={<SyncOutlined />} onClick={onRedo}>
            重新生成
          </Button>
          {!hideButtonMap['onKeep'] && (
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
          {!hideButtonMap['selectModel'] &&
            (modelIsRobot ? (
              <RobotSelect size="small" value={model} onChange={onModelChange} />
            ) : (
              <ModelSelect size="small" value={model} onChange={onModelChange} />
            ))}
          {action === AIAction.SCQW && <KnowledgeSelect size="small" onChange={onKnowledgeChange} />}
          <div style={{color: '#aaa', fontSize: '12px'}}>* 回车直接提交，shift+回车可换行，esc键可关闭</div>
        </div>
      </div>
    </div>
  );
};

export default memo(Component);
