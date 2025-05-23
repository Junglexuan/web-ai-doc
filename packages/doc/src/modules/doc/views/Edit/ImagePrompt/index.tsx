import {Input, InputNumber, Select, Space} from 'antd';
import {FC, memo} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

export type ImagePromptValue = {
  desc?: string;
  style?: string;
  width?: number;
  height?: number;
};

const styleOptions = [
  {label: '默认', value: '默认'},
  {label: '摄影', value: '摄影'},
  {label: '科技', value: '科技'},
  {label: '人像写真', value: '人像写真'},
  {label: '3D卡通', value: '3D卡通'},
  {label: '动画', value: '动画'},
  {label: '油彩', value: '油彩'},
  {label: '水彩', value: '水彩'},
  {label: '素描', value: '素描'},
  {label: '中国画', value: '中国画'},
  {label: '扁平插画', value: '扁平插画'},
];

interface Props {
  value?: ImagePromptValue;
  onChange: (value: ImagePromptValue) => void;
}

const Component: FC<Props> = ({value = {}, onChange}) => {
  const onDescChange = useEvent((e: any) => {
    onChange({...value, desc: e.target.value.trim()});
  });

  const onStyleChange = useEvent((style: string) => {
    onChange({...value, style});
  });

  const onWidthChange = useEvent((width?: number | null) => {
    onChange({...value, width: width || undefined});
  });

  const onHeightChange = useEvent((height?: number | null) => {
    onChange({...value, height: height || undefined});
  });

  return (
    <div className={styles.root}>
      <div className="title">生成图片</div>
      <Input placeholder="请输入图片描述..." value={value.desc} onChange={onDescChange} />
      <div className="title">图片风格</div>
      <Select placeholder="请选择..." options={styleOptions} value={value.style} onChange={onStyleChange} />
      <div className="title">宽</div>
      <InputNumber min={1} max={1440} value={value.width} onChange={onWidthChange} />
      <div className="title">高</div>
      <InputNumber min={1} max={1440} value={value.height} onChange={onHeightChange} />
    </div>
  );
};

export default memo(Component);
