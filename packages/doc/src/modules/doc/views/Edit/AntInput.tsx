import {Input} from 'antd';
import {forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {AIInputRef} from './utils';

interface Props {
  placeholder?: string;
  defaultValue?: string;
}

const Component = forwardRef<AIInputRef, Props>((props, ref) => {
  const inputRef = useRef<any>();

  // useEffect(() => {
  //   inputRef.current.focus();
  // }, []);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return inputRef.current?.resizableTextArea.textArea.value || '';
    },
  }));

  return <Input.TextArea ref={inputRef} autoSize variant="borderless" {...props} />;
});

export default memo(Component) as typeof Component;
