import {FC, memo} from 'react';
import AIBase from '../AIBase';
import AiAPI, {RunningState} from '../api';
import EasyEdit from '../EasyEdit';
import {useAIDialog} from '../hooks';
import type {IAIRef} from '../AILayer';

interface Props {
  aiRef: IAIRef;
  onRunningStateChange: (runningState: RunningState) => void;
}

const Component: FC<Props> = ({aiRef, onRunningStateChange}) => {
  const hooks = useAIDialog(aiRef, onRunningStateChange, AiAPI.createImage);

  return (
    <AIBase title="生成图片" hooks={hooks}>
      <EasyEdit
        ref={hooks.inputRef}
        tpl="生成图片：${content}，风格为${styles}，大小为${size}"
        option={{
          content: {
            placeholder: '输入主题描述',
            data: [{label: '晨雾翠绿的草地上一只毛茸茸的黄色小狗', key: '晨雾翠绿的草地上一只毛茸茸的黄色小狗'}],
          },
          styles: {
            placeholder: '输入或选择风格',
            data: [
              {label: '默认', key: '默认'},
              {label: '摄影', key: '摄影'},
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
        value={{
          text: '',
          tplValue: [
            {
              key: '生成图片：',
              type: 'text',
              value: '生成图片：',
            },
            {
              key: 'content',
              type: 'variable',
              value: ' ',
            },
            {
              key: '，风格为',
              type: 'text',
              value: '，风格为',
            },
            {
              key: 'styles',
              type: 'variable',
              value: ' ',
            },
            {
              key: '，大小为',
              type: 'text',
              value: '，大小为',
            },
            {
              key: 'size',
              type: 'variable',
              value: ' ',
            },
          ],
        }}
      />
    </AIBase>
  );
};

export default memo(Component);
