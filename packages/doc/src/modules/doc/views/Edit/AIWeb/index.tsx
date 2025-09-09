import {FC, memo} from 'react';
import AIBase from '../AIBase';
import AntInput from '../AntInput';
import AiAPI, {AIAction, RunningState} from '../api';
import {useAIDialog} from '../hooks';
import type {IAIRef} from '../AILayer';

interface Props {
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, onRunningStateChange}) => {
  const hooks = useAIDialog(AIAction.WYZJ, aiRef, onRunningStateChange, AiAPI.web, {}, false, true);

  return (
    <AIBase title="网页总结" action={AIAction.WYZJ} hooks={hooks} hideButton={['onKeep']}>
      <AntInput onSubmit={hooks.onPromptSubmit} ref={hooks.inputRef} placeholder="请输入网址..." />
    </AIBase>
  );
};

export default memo(Component);
