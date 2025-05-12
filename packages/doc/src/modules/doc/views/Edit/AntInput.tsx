import {Input} from 'antd';
import {forwardRef, memo, useImperativeHandle, useRef} from 'react';
import {useEvent} from '@/utils/tools';
import {AIInputRef} from './utils';

interface Props {
  placeholder?: string;
  defaultValue?: string;
  onSubmit: () => void;
}

const Component = forwardRef<AIInputRef, Props>((props, ref) => {
  const inputRef = useRef<any>();

  const onkeydown = useEvent((e: any) => {
    const {code} = e;
    if (code === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        props.onSubmit();
      }
    }
  });

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return inputRef.current?.resizableTextArea.textArea.value || '';
    },
    focus: () => {
      const textArea = inputRef.current.resizableTextArea.textArea as HTMLTextAreaElement;
      const value: string = textArea.value || '';
      textArea.focus();
      textArea.setSelectionRange(value.length, value.length);
    },
  }));

  return <Input.TextArea ref={inputRef} autoSize variant="borderless" onKeyDown={onkeydown} {...props} />;
});

export default memo(Component) as typeof Component;
