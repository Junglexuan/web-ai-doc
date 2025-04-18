import {FC, memo} from 'react';
//import AdjustIcon from '@/assets/images/Adjust';
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
  const hooks = useAIDialog(aiRef, onRunningStateChange, AiAPI.createFullText);

  return (
    <AIBase title="生成全文" hooks={hooks}>
      <AntInput ref={hooks.inputRef} placeholder="请描述要“生成全文”的主题和各种要求..." defaultValue={`围绕 “${aiRef.getTitle()}” 写一篇文章`} />
    </AIBase>
  );
};

export default memo(Component);
