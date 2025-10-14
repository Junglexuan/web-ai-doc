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
  {value: '${DATE.NOW()}', label: '此时此刻', field: 'Now'},
  {value: '${DATE.TODAY()}', label: '当前日', field: 'Today'},
  {value: '${DATE.MONTH()}', label: '当前月', field: 'Month'},
  {value: '${DATE.YEAR()}', label: '当前年', field: 'Year'},
  {value: '${DATE.CUSTOMIZE(***)}', label: '自定义格式', field: ''},
];

function matchValue(code: string): string[] {
  if (code.startsWith('${DATE.CUSTOMIZE(')) {
    const arr = code.match(/CUSTOMIZE\((.+?)\)/);
    return ['${DATE.CUSTOMIZE(***)}', arr ? arr[1].slice(1, -1) : 'YYYY-MM-dd HH:mm:ss'];
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
    setValue(fun === '${DATE.CUSTOMIZE(***)}' ? [fun, 'YYYY-MM-dd HH:mm:ss'] : [fun]);
  }, []);

  const onInputChange = useEvent((e: any) => {
    setValue([value[0], e.target.value.trim()]);
  });

  const onOk = useEvent(() => {
    const [fun, args] = value;
    const option = options.find((item) => item.value === fun);
    onSubmit(elem, {field: `_${option!.field || args}`, source: args ? fun.replace('(***)', `('${args}')`) : fun, info: option!.label});
  });

  return (
    <div className={styles.root}>
      <div className="bd">
        <Radio.Group style={style} onChange={onRadioChange} value={value[0]} options={options}></Radio.Group>
        {value[0] === '${DATE.CUSTOMIZE(***)}' && <Input placeholder="YYYY-MM-dd HH:mm:ss" value={value[1]} onChange={onInputChange} />}
      </div>
      <div className="dialogFooter">
        <Button size="small" type="primary" onClick={onOk}>
          确定
        </Button>
        {/* <Button size="small" onClick={onOk}>
          格式
        </Button> */}
        <Button size="small" onClick={onCancel}>
          取消
        </Button>
      </div>
    </div>
  );
};

export default memo(Component);
