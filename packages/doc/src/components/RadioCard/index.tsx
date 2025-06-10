import {FC, memo} from 'react';
import styles from './index.module.less';

interface Props {
  value?: string;
  onChange?: (value: string, item: {value: string; label: string}) => void;
  options: {value: string; label: string}[];
}

const Component: FC<Props> = ({value, onChange, options}) => {
  return (
    <div className={styles.root}>
      {options.map((item) => (
        <div className={value === item.value ? 'on' : ''} key={item.value} onClick={() => onChange?.(item.value, item)}>
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default memo(Component);
