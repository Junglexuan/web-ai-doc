import {FC, memo} from 'react';
import EasyEdit from '@/components/EasyEdit';
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
      <EasyEdit
        tpl="你是一名${role}，需要整理本周工作周报，本周主要工作内容为${text}，下周主要工作计划为${newText}"
        option={{
          role: {
            placeholder: '请输入角色',
            data: [
              {label: '管理员', key: '管理员'},
              {label: '普通职员', key: '普通职员'},
            ],
          },
          text: {
            placeholder: '请输入你想表达的意思',
            data: [
              {label: '改了两个bug', key: '改了两个bug'},
              {label: '做了一个新需求', key: '做了一个新需求'},
            ],
          },
        }}
        value={{
          text: '你是一名管理员，需要整理本周工作周报，本周主要工作内容为 ，下周主要工作计划为 ',
          tplValue: [
            {
              key: '你是一名',
              type: 'text',
              value: '你是一名',
            },
            {
              key: 'role',
              type: 'variable',
              value: '管理员',
            },
            {
              key: '，需要整理本周工作周报，本周主要工作内容为',
              type: 'text',
              value: '，需要整理本周工作周报，本周主要工作内容为',
            },
            {
              key: 'text',
              type: 'variable',
              value: ' ',
            },
            {
              key: '，下周主要工作计划为',
              type: 'text',
              value: '，下周主要工作计划为',
            },
            {
              key: 'newText',
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

{
  /* <Input
        ref={hooks.inputRef}
        onPressEnter={hooks.onPromptSubmit}
        placeholder="请描述要“生成大纲”的主题和各种要求..."
        defaultValue={`围绕 “${aiRef.getTitle()}” 生成一篇文章大纲`}
        variant="borderless"
      /> */
}
