import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  QuestionCircleFilled,
  SlidersOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {Button, Input, Space, Spin} from 'antd';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import AdjustIcon from '@/assets/images/Adjust';
import {useEvent} from '@/utils/tools';
import AiAPI, {RunningState} from '../api';
import ColorAIcon from '../ColorAIcon';
import EnterIcon from '../EnterIcon';
import styles from './index.module.less';
import type {IAIRef} from '../AILayer';

interface Props {
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, onRunningStateChange}) => {
  const inputRef = useRef<any>();
  const [runningState, setRunningState] = useState<RunningState>('');
  const [fragment, setFragment] = useState('');

  const onPromptSubmit = useEvent(() => {
    const text = inputRef.current.input.value;
    setRunningState('Pending');
    onRunningStateChange('Pending');
    AiAPI.continueWrite(text).then(
      (html) => {
        setFragment(html);
        setRunningState('Fulfilled');
        onRunningStateChange('Fulfilled');
      },
      () => {
        setRunningState('Rejected');
        onRunningStateChange('Rejected');
      }
    );
  });
  const redo = useEvent(() => {
    onPromptSubmit();
  });

  const insert = useEvent(() => {
    aiRef.closeMenu();
    aiRef.insertHtml(fragment);
  });

  useEffect(() => {
    inputRef.current.input.focus();
  }, []);
  return (
    <div className={styles.root + ' ' + runningState}>
      <ColorAIcon />
      <div className="input">
        <EnterIcon onClick={onPromptSubmit} />
        <Input ref={inputRef} placeholder="请选择或输入指令，如：写一份工作报告" variant="borderless" onPressEnter={onPromptSubmit} />
      </div>
      <div className="result">
        <Spin className="loading" size="small" />
        <div className="title">{inputRef.current?.input.value || '继续写'}...</div>
        <Button size="small" className="pause-btn" type="text" icon={<PauseCircleOutlined />}>
          停止
        </Button>
        <div className="article" dangerouslySetInnerHTML={{__html: fragment}}></div>
      </div>
      <div className="footer">
        <Space size="small" className="actions">
          <Button type="primary" icon={<CheckOutlined />} onClick={insert}>
            插入
          </Button>
          <Button type="text" icon={<SyncOutlined />} onClick={redo}>
            换一换
          </Button>
          <Button type="text" icon={<EditOutlined />} onClick={redo}>
            继续写
          </Button>
          <Button type="text" icon={<AdjustIcon />}>
            调整内容
          </Button>
          <Button type="text" icon={<DeleteOutlined />} onClick={aiRef.closeMenu}>
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
