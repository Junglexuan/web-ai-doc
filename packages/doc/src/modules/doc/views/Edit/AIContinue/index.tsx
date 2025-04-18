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
  const hooks = useAIDialog(aiRef, onRunningStateChange, AiAPI.continueWrite, {}, true);

  return (
    <AIBase title="继续写" hooks={hooks}>
      <AntInput ref={hooks.inputRef} placeholder="您可以输入“继续写”的各种要求..." />
    </AIBase>
  );
};

export default memo(Component);
