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
  const hooks = useAIDialog(AIAction.SJZNT, aiRef, onRunningStateChange, AiAPI.chart, {}, false, true);
  return (
    <AIBase title="数据智能体" action={AIAction.SJZNT} hooks={hooks}>
      <AntInput ref={hooks.inputRef} onSubmit={hooks.onPromptSubmit} placeholder="请输入问题..." />
    </AIBase>
  );
};

export default memo(Component);
