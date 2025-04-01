import {CheckOutlined, DeleteOutlined, EditOutlined, PauseCircleOutlined, QuestionCircleFilled, SyncOutlined} from '@ant-design/icons';
import {Button, Checkbox, Input, Select, Space, Spin} from 'antd';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import AdjustIcon from '@/assets/images/Adjust';
import {useEvent} from '@/utils/tools';
import styles from '../aiDialog.module.less';
import AiAPI, {RunningState} from '../api';
import ColorAIcon from '../ColorAIcon';
import EnterIcon from '../EnterIcon';
import type {IAIRef} from '../AILayer';

interface Props {
  template: string;
  templateOptions: {value: string; label: string}[];
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, template, templateOptions, onRunningStateChange}) => {
  const inputRef = useRef<any>();
  const fragmentRef = useRef<any>();
  const [runningState, setRunningState] = useState<RunningState>('');
  const [fragment, setFragment] = useState('');

  const onPromptSubmit = useEvent(() => {
    const text = inputRef.current.input.value;
    const lastResult = {html: fragmentRef.current.innerHTML || '', text: fragmentRef.current.innerText || ''};
    setRunningState('Pending');
    onRunningStateChange('Pending');
    AiAPI.byTemplate(aiRef.getDocId(), lastResult.text || text).then(
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
          defaultValue={aiRef.getTitle()}
          placeholder="请选择或输入指令，如：写一份工作报告"
          variant="borderless"
          onPressEnter={onPromptSubmit}
        />
      </div>
      <div className="result">
        <Spin className="loading" size="small" />
        <div className="title">{inputRef.current?.input.value || '继续写'}...</div>
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
        <Space size="small" className="prompt">
          <Checkbox defaultChecked />
          <span>使用模版:</span>
          <Select value={template} style={{width: 120}} options={templateOptions} />
        </Space>
        <QuestionCircleFilled style={{color: '#aaa', cursor: 'pointer'}} />
      </div>
    </div>
  );
};

export default memo(Component);
