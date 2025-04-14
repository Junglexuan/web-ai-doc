import {Input} from 'antd';
import {FC, memo} from 'react';
import AIBase from '../AIBase';
import AiAPI, {RunningState} from '../api';
import {useAIDialog} from '../hooks';
import type {IAIRef} from '../AILayer';

interface Props {
  title: string;
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({title, aiRef, onRunningStateChange}) => {
  const hooks = useAIDialog(aiRef, onRunningStateChange, AiAPI.stylize, {title}, true);

  return (
    <AIBase title={title} hooks={hooks} automatic>
      <Input ref={hooks.inputRef} onPressEnter={hooks.onPromptSubmit} defaultValue={title} variant="borderless" />
    </AIBase>
  );
};

export default memo(Component);
