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
import {FC, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  const fragmentRef = useRef<HTMLDivElement>();
  const [runningState, setRunningState] = useState<RunningState>('');
  const [fragment, setFragment] = useState('');
  const reqRef = useRef<AbortController>();

  const onPromptSubmit = useEvent(() => {
    //const text = inputRef.current.input.value;

    setRunningState('Pending');
    onRunningStateChange('Pending');
    reqRef.current = AiAPI.continueWrite({
      args: {
        docId: aiRef.getDocId(),
        context: fragment ? aiRef.getContext() + fragmentRef.current!.innerText : aiRef.getContext(),
        continuedType: 'paragraph',
      },
      onMessage: (html) => {
        console.log(html);
        const scroller = fragmentRef.current!;
        setFragment(scroller.innerHTML + html);
        scroller.scrollTo({top: 999999999});
      },
      onError: (e) => {
        console.log(e);
        setRunningState('Rejected');
        onRunningStateChange('Rejected');
      },
      onDone: () => {
        setRunningState('Fulfilled');
        onRunningStateChange('Fulfilled');
      },
    });
    // .then(
    //   (html) => {
    //     setFragment(lastResult.html + html);
    //     setRunningState('Fulfilled');
    //     onRunningStateChange('Fulfilled');
    //   },
    //   () => {
    //     setRunningState('Rejected');
    //     onRunningStateChange('Rejected');
    //   }
    // );
  });
  const reDo = useCallback(() => {
    setFragment('');
    setTimeout(onPromptSubmit);
  }, [onPromptSubmit]);

  const continueDo = useCallback(() => {
    onPromptSubmit();
  }, [onPromptSubmit]);

  const onStop = useEvent(() => {
    reqRef.current?.abort();
    setRunningState('Fulfilled');
    onRunningStateChange('Fulfilled');
  });

  const insert = useEvent(() => {
    aiRef.closeMenu();
    aiRef.insertHtmlByAI(fragmentRef.current!.innerHTML);
  });

  useEffect(() => {
    inputRef.current.input.focus();
  }, []);
  return (
    <div className={styles.common + ' ' + runningState}>
      <ColorAIcon />
      <div className="input">
        <EnterIcon onClick={onPromptSubmit} />
        <Input ref={inputRef} placeholder="请选择或输入指令，如：写一份工作报告" variant="borderless" onPressEnter={onPromptSubmit} />
      </div>
      <div className="result">
        <Spin className="loading" size="small" />
        <div className="title">{inputRef.current?.input.value || '继续写'}...</div>
        <Button size="small" className="pause-btn" type="text" icon={<PauseCircleOutlined />} onClick={onStop}>
          停止
        </Button>
        <div className="article" ref={fragmentRef as any} dangerouslySetInnerHTML={{__html: fragment}}></div>
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
