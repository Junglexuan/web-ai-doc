import {CheckOutlined, DeleteOutlined, EditOutlined, PauseCircleOutlined, QuestionCircleFilled, SyncOutlined} from '@ant-design/icons';
import {Button, Space, Spin} from 'antd';
import {FC, ReactElement, memo, useCallback, useEffect, useMemo} from 'react';
import AdjustIcon from '@/assets/images/Adjust';
import ColorAIcon from '../ColorAIcon';
import EnterIcon from '../EnterIcon';
import {AIDialogHooks} from '../hooks';
import styles from './index.module.less';

interface Props {
  title: string;
  children: ReactElement;
  hooks: AIDialogHooks;
  automatic?: boolean;
  hideButton?: 'onKeep'[];
}

const Component: FC<Props> = ({title, children, hooks, automatic, hideButton}) => {
  const {onPromptSubmit, inputRef, fragment, fragmentRef, runningState, onRedo, onKeep, onStop, onInsert, onAdjust} = hooks;
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

  return (
    <div id="_ai_dialog" className={styles.common + ' ' + runningState}>
      <ColorAIcon />
      <div className="input">
        <EnterIcon onClick={onPromptSubmit} />
        {children}
      </div>
      <div className="result">
        <Spin className="loading" size="small" />
        <div className="title">{inputRef.current?.getValue() || title}...</div>
        <Button size="small" className="pause-btn" type="text" icon={<PauseCircleOutlined />} onClick={onStop}>
          停止
        </Button>
        <div className="article" ref={fragmentRef as any} dangerouslySetInnerHTML={{__html: fragment}} onClick={onFragmentClick}></div>
      </div>
      <div className="footer">
        <Space size="small" className="actions">
          <Button type="primary" icon={<CheckOutlined />} onClick={onInsert}>
            插入
          </Button>
          <Button type="text" icon={<SyncOutlined />} onClick={onRedo}>
            换一换
          </Button>
          {!hideButtonMap['onKeep'] && (
            <Button type="text" icon={<EditOutlined />} onClick={onKeep}>
              继续写
            </Button>
          )}
          <Button type="text" icon={<AdjustIcon />} onClick={onAdjust}>
            调整
          </Button>
          <Button type="text" icon={<DeleteOutlined />} onClick={hooks.aiRef.closeMenu}>
            弃用
          </Button>
        </Space>
        <div>
          <QuestionCircleFilled style={{color: '#aaa', cursor: 'pointer'}} />
        </div>
      </div>
    </div>
  );
};

export default memo(Component);
