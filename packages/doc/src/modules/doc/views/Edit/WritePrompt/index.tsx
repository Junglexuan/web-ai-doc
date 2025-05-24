import {Input, InputNumber, Select} from 'antd';
import {FC, memo} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

export type WritePromptValue = {
  desc?: string;
  model?: string;
  size?: number;
};

const modelOptions = [
  {
    label: <span>通义千问</span>,
    options: [
      {label: <span>qwen-max</span>, value: 'qwen-max'},
      {label: <span>qwen-turbo</span>, value: 'qwen-turbo'},
      {label: <span>qwen-plus</span>, value: 'qwen-plus'},
    ],
  },
  {
    label: <span>深度思索</span>,
    options: [{label: <span>deepseek-chat</span>, value: 'deepseek-chat'}],
  },
];

interface Props {
  value?: WritePromptValue;
  onChange: (value: WritePromptValue) => void;
}

const Component: FC<Props> = ({value = {}, onChange}) => {
  const onDescChange = useEvent((e: any) => {
    onChange({...value, desc: e.target.value.trim()});
  });

  const onModelChange = useEvent((model: string) => {
    onChange({...value, model});
  });

  const onSizeChange = useEvent((size?: number | null) => {
    onChange({...value, size: size || undefined});
  });

  return (
    <div className={styles.root}>
      <div className="title">内容描述:</div>
      <Input.TextArea placeholder="请输入内容描述..." value={value.desc} onChange={onDescChange} />
      <div className="title">AI模型:</div>
      <Select placeholder="请选择..." options={modelOptions} value={value.model} onChange={onModelChange} />
      <div className="title">字数限制:</div>
      <InputNumber min={1} value={value.size} onChange={onSizeChange} />
    </div>
  );
};

export default memo(Component);
