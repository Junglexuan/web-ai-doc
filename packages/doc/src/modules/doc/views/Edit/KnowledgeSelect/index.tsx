import {Select} from 'antd';
import {FC, memo, useEffect, useState} from 'react';
import {AiAPI} from '../api';
import styles from './index.module.less';

let knowledgeOptions: {label: string; value: string}[] | null = null;

interface Props {
  size?: 'small';
  value?: string[];
  onChange?: (value: string[]) => void;
}

const Component: FC<Props> = ({size, value, onChange}) => {
  const [options, setOptions] = useState<{label: string; value: string}[]>(knowledgeOptions || []);
  useEffect(() => {
    if (!knowledgeOptions) {
      AiAPI.getMyKnowledges().then((list) => {
        knowledgeOptions = list;
        setOptions(list);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Select
      size={size}
      className={styles.root}
      placeholder="请选择知识库..."
      options={options}
      value={value?.[0]}
      onChange={(val) => onChange?.(val ? [val] : [])}
    />
  );
};

export default memo(Component);
