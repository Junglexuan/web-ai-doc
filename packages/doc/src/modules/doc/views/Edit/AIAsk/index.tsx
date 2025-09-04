import {FC, memo} from 'react';
import AIBase from '../AIBase';
import AntInput from '../AntInput';
import AiAPI, {RunningState} from '../api';
import {useAIDialog} from '../hooks';
import type {IAIRef} from '../AILayer';

interface Props {
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, onRunningStateChange}) => {
  const hooks = useAIDialog(aiRef, onRunningStateChange, AiAPI.ask, {}, false, true, 'AI提问');
  return (
    <AIBase title="AI提问" hooks={hooks}>
      <AntInput ref={hooks.inputRef} onSubmit={hooks.onPromptSubmit} placeholder="请输入问题..." />
    </AIBase>
  );
};

export default memo(Component);
