import {Select} from 'antd';
import {ReactElement, useEffect, useState} from 'react';
import {AiAPI} from '../api';
import styles from './index.module.less';

let knowledgeOptions: {label: string; value: string}[] | null = null;

interface Props<T> {
  size?: 'small';
  value?: T;
  onChange?: (value: T) => void;
  mode?: 'multiple';
}

export default function Component<T extends string | string[]>(props: Props<T>): ReactElement {
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
  return <Select className={styles.root} placeholder="请选择知识库..." options={options} {...props} />;
}
