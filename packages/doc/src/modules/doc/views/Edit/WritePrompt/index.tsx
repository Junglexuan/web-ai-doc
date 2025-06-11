import {Input, InputNumber} from 'antd';
import {FC, memo} from 'react';
import {useEvent} from '@/utils/tools';
import ModelSelect from '../ModelSelect';
import styles from './index.module.less';

export type WritePromptValue = {
  desc?: string;
  model?: string;
  size?: number;
  example?: string;
};

interface Props {
  value?: WritePromptValue;
  onChange: (value: WritePromptValue) => void;
}

const Component: FC<Props> = ({value = {}, onChange}) => {
  const onDescChange = useEvent((e: any) => {
    onChange({...value, desc: e.target.value.trim()});
  });

  const onExampleChange = useEvent((e: any) => {
    onChange({...value, example: e.target.value.trim()});
  });

  const onModelChange = useEvent((model: string) => {
    onChange({...value, model});
  });

  const onSizeChange = useEvent((size?: number | null) => {
    onChange({...value, size: size || undefined});
  });

  return (
    <div className={styles.root}>
      <div className="title">
        <em>*</em>
        <span>内容描述:</span>
      </div>
      <Input.TextArea placeholder="请输入内容描述..." value={value.desc} onChange={onDescChange} />
      <div className="title">
        <span>示例模版:</span>
      </div>
      <Input.TextArea placeholder="请输入示例模版:..." value={value.example} onChange={onExampleChange} />
      <div className="title">AI模型:</div>
      <ModelSelect value={value.model} onChange={onModelChange} />
      <div className="title">字数限制:</div>
      <InputNumber min={1} value={value.size} onChange={onSizeChange} />
    </div>
  );
};

export default memo(Component);
