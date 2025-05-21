import {Input, Radio} from 'antd';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {VariableElement} from '../elements/Variable/custom-types';
import styles from './index.module.less';

const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

interface Props {
  onSubmit: (elem: VariableElement, update: Partial<VariableElement>) => void;
  elem: VariableElement;
}

const Component: FC<Props> = ({onSubmit, elem}) => {
  const onChange = (e: any) => {
    onSubmit(elem, {source: e.target.value});
  };

  return (
    <div className={styles.root}>
      <Radio.Group
        style={style}
        onChange={onChange}
        value={elem.source}
        options={[
          {value: '{{YYYY}}', label: '此时此刻'},
          {value: '{{YYYY-MM}}', label: '今年'},
        ]}
      ></Radio.Group>
    </div>
  );
};

export default memo(Component);
