import {Input} from 'antd';
import {FC, memo} from 'react';
//import AdjustIcon from '@/assets/images/Adjust';
import AIBase from '../AIBase';
import AiAPI, {RunningState} from '../api';
import {useAIDialog} from '../hooks';
import type {IAIRef} from '../AILayer';

interface Props {
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, onRunningStateChange}) => {
  const hooks = useAIDialog(aiRef, onRunningStateChange, AiAPI.createOutline);

  return (
    <AIBase title="生成大纲" hooks={hooks}>
      <Input
        ref={hooks.inputRef}
        onPressEnter={hooks.onPromptSubmit}
        placeholder="请描述要“生成大纲”的主题和各种要求..."
        defaultValue={`围绕 “${aiRef.getTitle()}” 生成一篇文章大纲`}
        variant="borderless"
      />
    </AIBase>
  );
};

export default memo(Component);
