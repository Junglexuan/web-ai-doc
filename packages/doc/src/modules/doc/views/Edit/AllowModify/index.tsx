import {Checkbox, Input} from 'antd';
import {FC, memo, useState} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

interface Props {
  value?: string;
  onChange: (value?: string) => void;
}

const Component: FC<Props> = ({value, onChange}) => {
  const onAllowChange = useEvent((e: any) => {
    if (e.target.checked) {
      onChange('');
    } else {
      onChange(undefined);
    }
  });
  return (
    <div className={styles.root}>
      <Checkbox className="allowInput" checked={value !== undefined} onChange={onAllowChange}>
        允许用户修改
      </Checkbox>
      {value !== undefined && (
        <div className="formItem">
          <div className="label">字段定义:</div>
          <Input className="input" placeholder="显示给用户的字段名称" value={value} onChange={(e) => onChange(e.target.value.trim())} />
        </div>
      )}
    </div>
  );
};

export default memo(Component);
