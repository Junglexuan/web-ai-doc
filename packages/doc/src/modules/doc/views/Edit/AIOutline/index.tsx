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
import styles from '../aiDialog.module.less';
import AiAPI, {RunningState} from '../api';
import ColorAIcon from '../ColorAIcon';
import EnterIcon from '../EnterIcon';
import type {IAIRef} from '../AILayer';

interface Props {
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, onRunningStateChange}) => {
  const inputRef = useRef<any>();
  const fragmentRef = useRef<any>();
  const [runningState, setRunningState] = useState<RunningState>('');
  const [fragment, setFragment] = useState('');

  const onPromptSubmit = useEvent(() => {
    const text = inputRef.current.input.value;
    const lastResult = {html: fragmentRef.current.innerHTML || '', text: fragmentRef.current.innerText || ''};
    setRunningState('Pending');
    onRunningStateChange('Pending');
    AiAPI.createOutline(aiRef.getDocId(), lastResult.text || text).then(
      (html) => {
        setFragment(lastResult.html + html);
        setRunningState('Fulfilled');
        onRunningStateChange('Fulfilled');
      },
      () => {
        setRunningState('Rejected');
        onRunningStateChange('Rejected');
      }
    );
  });
  const reDo = useEvent(() => {
    setFragment('');
    setTimeout(onPromptSubmit);
  });
  const continueDo = useEvent(() => {
    onPromptSubmit();
  });

  const insert = useEvent(() => {
    aiRef.closeMenu();
    aiRef.insertHtmlByAI(fragmentRef.current.innerHTML);
  });

  useEffect(() => {
    inputRef.current.input.focus();
  }, []);
  return (
    <div className={styles.common + ' ' + runningState}>
      <ColorAIcon />
      <div className="input">
        <EnterIcon onClick={onPromptSubmit} />
        <Input
          ref={inputRef}
          placeholder="请输入提示词"
          variant="borderless"
          defaultValue={`围绕 “${aiRef.getTitle()}” 写一篇文章大纲`}
          onPressEnter={onPromptSubmit}
        />
      </div>
      <div className="result">
        <Spin className="loading" size="small" />
        <div className="title">{inputRef.current?.input.value || '生成大纲'}...</div>
        <Button size="small" className="pause-btn" type="text" icon={<PauseCircleOutlined />}>
          停止
        </Button>
        <div className="article" ref={fragmentRef} dangerouslySetInnerHTML={{__html: fragment}}></div>
      </div>
      <div className="footer">
        <Space size="small" className="actions">
          <Button type="primary" icon={<CheckOutlined />} onClick={insert}>
            插入
          </Button>
          <Button type="text" icon={<SyncOutlined />} onClick={reDo}>
            换一换
          </Button>
          <Button type="text" icon={<EditOutlined />} onClick={continueDo}>
            继续写
          </Button>
          {/* <Button type="text" icon={<AdjustIcon />}>
            调整内容
          </Button> */}
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
