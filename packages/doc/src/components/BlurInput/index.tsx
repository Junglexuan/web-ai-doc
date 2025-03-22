import {Input, InputProps} from 'antd';
import {FC, memo, useCallback, useMemo, useState} from 'react';
import {useEvent} from '@/utils/tools';

export interface Props extends InputProps {
  value?: string;
  onChange?: (value?: any) => void;
  onBlur?: () => void;
  reg?: string;
}

const Component: FC<Props> = ({value = '', onChange, onBlur, reg, ...others}) => {
  const [input, setInput] = useState(value);

  useMemo(() => {
    setInput(value);
  }, [value]);

  const onInputChange = useCallback((e: any) => {
    setInput(e.target.value);
  }, []);

  const onSubmit = useEvent(() => {
    onBlur && onBlur();
    let newValue = input.trim();
    if (reg && !new RegExp(reg).test(newValue)) {
      newValue = '';
    }
    setInput(newValue);
    if (value !== newValue) {
      onChange?.(newValue);
    }
  });

  return <Input value={input} onChange={onInputChange} onBlur={onSubmit} {...others} />;
};

export default memo(Component);
