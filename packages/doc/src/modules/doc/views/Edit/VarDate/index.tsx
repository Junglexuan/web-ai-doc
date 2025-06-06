import {Button, Input, Radio, Space} from 'antd';
import {FC, memo, useCallback, useState} from 'react';
import {useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import styles from './index.module.less';

const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const options = [
  {value: '${DATE.NOW()}', label: '此时此刻'},
  {value: '${DATE.TODAY()}', label: '当前日'},
  {value: '${DATE.MONTH()}', label: '当前月'},
  {value: '${DATE.YEAR()}', label: '当前年'},
  {value: '${DATE.CUSTOMIZE(***)}', label: '自定义格式'},
];

function matchValue(code: string): string[] {
  if (code.startsWith('${DATE.CUSTOMIZE(')) {
    const arr = code.match(/CUSTOMIZE\((.+?)\)/);
    return ['${DATE.CUSTOMIZE(***)}', arr ? arr[1].slice(1, -1) : 'YYYY-MM-DD HH:MM:SS'];
  } else {
    return [code];
  }
}

interface Props {
  onCancel: () => void;
  onSubmit: (elem: VariableElement, update: Partial<VariableElement>) => void;
  elem: VariableElement;
}

const Component: FC<Props> = ({onSubmit, onCancel, elem}) => {
  const [value, setValue] = useState(() => matchValue(elem.source));

  const onRadioChange = useCallback((e: any) => {
    const fun = e.target.value;
    setValue(fun === '${DATE.CUSTOMIZE(***)}' ? [fun, 'YYYY-MM-DD HH:MM:SS'] : [fun]);
  }, []);

  const onInputChange = useEvent((e: any) => {
    setValue([value[0], e.target.value.trim()]);
  });

  const onOk = useEvent(() => {
    const [fun, args] = value;
    onSubmit(elem, {source: args ? fun.replace('(***)', `('${args}')`) : fun, info: options.find((item) => item.value === fun)?.label});
  });

  return (
    <div className={styles.root}>
      <div className="bd">
        <Radio.Group style={style} onChange={onRadioChange} value={value[0]} options={options}></Radio.Group>
        {value[0] === '${DATE.CUSTOMIZE(***)}' && <Input placeholder="YYYY-MM-DD HH:MM:SS" value={value[1]} onChange={onInputChange} />}
      </div>
      <Space className="ft">
        <Button size="small" type="primary" onClick={onOk}>
          确定
        </Button>
        <Button size="small" onClick={onCancel}>
          取消
        </Button>
      </Space>
    </div>
  );
};

export default memo(Component);
