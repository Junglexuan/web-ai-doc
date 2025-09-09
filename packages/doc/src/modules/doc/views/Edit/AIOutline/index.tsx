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
  const hooks = useAIDialog(AIAction.SCDG, aiRef, onRunningStateChange, AiAPI.createOutline);

  return (
    <AIBase title="生成大纲" action={AIAction.SCDG} hooks={hooks}>
      <AntInput
        onSubmit={hooks.onPromptSubmit}
        ref={hooks.inputRef}
        placeholder="请描述要“生成大纲”的主题和各种要求..."
        defaultValue={`围绕 “${aiRef.getTitle()}” 生成一篇文章大纲，要求简明扼要`}
      />
    </AIBase>
  );
};

export default memo(Component);
