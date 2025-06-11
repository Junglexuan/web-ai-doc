import {FC, memo, useState} from 'react';
import AIBase from '../AIBase';
import AiAPI, {RunningState} from '../api';
import EasyEdit from '../EasyEdit';
import {useAIDialog} from '../hooks';
import ImagePrompt, {ImagePromptValue} from '../ImagePrompt';
import type {IAIRef} from '../AILayer';

interface Props {
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, onRunningStateChange}) => {
  const hooks = useAIDialog(aiRef, onRunningStateChange, AiAPI.createImage);
  const [tplValue, setTplvalue] = useState<ImagePromptValue>();

  return (
    <AIBase title="生成图片" hooks={hooks} hideButton={['onKeep', 'selectModel']}>
      <ImagePrompt askMode ref={hooks.inputRef} value={tplValue} onChange={setTplvalue} onSubmit={hooks.onPromptSubmit} />
      {/* <EasyEdit
        ref={hooks.inputRef}
        tpl="生成图片：${content}，风格为${styles}，大小为${size}"
        value={tplValue}
        onChange={setTplvalue}
        onSubmit={hooks.onPromptSubmit}
        option={{
          content: {
            placeholder: '输入主题描述',
            data: [],
          },
          styles: {
            placeholder: '输入或选择风格',
            data: [
              {label: '默认', key: '默认'},
              {label: '摄影', key: '摄影'},
              {label: '科技', key: '科技'},
              {label: '人像写真', key: '人像写真'},
              {label: '3D卡通', key: '3D卡通'},
              {label: '动画', key: '动画'},
              {label: '油彩', key: '油彩'},
              {label: '水彩', key: '水彩'},
              {label: '素描', key: '素描'},
              {label: '中国画', key: '中国画'},
              {label: '扁平插画', key: '扁平插画'},
            ],
          },
          size: {
            placeholder: '选择分辨率',
            data: [
              {label: '1024*1024', key: '1024*1024'},
              {label: '720*1280', key: '720*1280'},
              {label: '1280*720', key: '1280*720'},
            ],
          },
        }}
      /> */}
    </AIBase>
  );
};

export default memo(Component);
