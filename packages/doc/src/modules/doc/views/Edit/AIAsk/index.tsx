import {Input} from 'antd';
import {FC, memo} from 'react';
import AIBase from '../AIBase';
import AiAPI, {RunningState} from '../api';
import {useAIDialog} from '../hooks';
import type {IAIRef} from '../AILayer';

interface Props {
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, onRunningStateChange}) => {
  const hooks = useAIDialog(aiRef, onRunningStateChange, AiAPI.ask, {}, false, true);

  return (
    <AIBase title="提问" hooks={hooks}>
      <Input ref={hooks.inputRef} onPressEnter={hooks.onPromptSubmit} placeholder="请输入问题..." variant="borderless" />
    </AIBase>
  );
};

export default memo(Component);
