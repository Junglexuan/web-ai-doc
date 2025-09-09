import {FC, memo} from 'react';
import AIBase from '../AIBase';
import AntInput from '../AntInput';
import AiAPI, {RunningState} from '../api';
import {useAIDialog} from '../hooks';
import type {IAIRef} from '../AILayer';

interface Props {
  title: string;
  action: string;
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({title, action, aiRef, onRunningStateChange}) => {
  const hooks = useAIDialog(action, aiRef, onRunningStateChange, AiAPI.stylize, {}, true);

  return (
    <AIBase title={title} action={action} hooks={hooks} automatic>
      <AntInput onSubmit={hooks.onPromptSubmit} ref={hooks.inputRef} defaultValue={title} />
    </AIBase>
  );
};

export default memo(Component);
