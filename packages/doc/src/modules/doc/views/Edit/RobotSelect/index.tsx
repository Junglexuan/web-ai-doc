import {Select} from 'antd';
import {FC, memo, useEffect, useState} from 'react';
import {DefaultModel} from '@/Global';
import {AiAPI} from '../api';
import styles from './index.module.less';

interface Props {
  size?: 'small';
  value?: string;
  onChange: (value: string) => void;
}

let RobotOptions: Promise<{label: string; value: string}[]> | null = null;

const Component: FC<Props> = ({size, value = DefaultModel, onChange}) => {
  const [options, setOptions] = useState<{label: string; value: string}[]>([]);
  useEffect(() => {
    if (!RobotOptions) {
      RobotOptions = AiAPI.getMyRobots();
    }
    RobotOptions.then((list) => {
      setOptions(list);
      if (!list.some((item) => item.value === value)) {
        onChange(list[0]?.value);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Select size={size} className={styles.root} placeholder="请选择..." options={options} value={value} onChange={onChange} />;
};

export default memo(Component);
