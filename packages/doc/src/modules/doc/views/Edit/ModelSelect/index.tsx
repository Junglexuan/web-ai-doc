import {Select} from 'antd';
import {FC, memo} from 'react';
import styles from './index.module.less';

const modelOptions = [
  {
    label: <span>通义千问</span>,
    options: [
      {label: <span>qwen-max</span>, value: 'qwen-max'},
      {label: <span>qwen-turbo</span>, value: 'qwen-turbo'},
      {label: <span>qwen-plus</span>, value: 'qwen-plus'},
      {label: <span>qwen2.5-72B-instruct</span>, value: 'qwen2.5-72B-instruct'},
    ],
  },
  {
    label: <span>深度思索</span>,
    options: [{label: <span>deepseek-chat</span>, value: 'deepseek-chat'}],
  },
];

interface Props {
  size?: 'small';
  value?: string;
  onChange: (value: string) => void;
}

const Component: FC<Props> = ({size, value, onChange}) => {
  return <Select size={size} className={styles.root} placeholder="请选择..." options={modelOptions} value={value} onChange={onChange} />;
};

export default memo(Component);
