import {Input, InputNumber, Select} from 'antd';
import {forwardRef, memo, useImperativeHandle, useRef} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

export type ImagePromptValue = {
  desc?: string;
  style?: string;
  width?: number;
  height?: number;
};

const styleOptions = [
  {label: '默认', value: '默认'},
  {label: '摄影', value: '摄影'},
  {label: '科技', value: '科技'},
  {label: '人像写真', value: '人像写真'},
  {label: '3D卡通', value: '3D卡通'},
  {label: '动画', value: '动画'},
  {label: '油彩', value: '油彩'},
  {label: '水彩', value: '水彩'},
  {label: '素描', value: '素描'},
  {label: '中国画', value: '中国画'},
  {label: '扁平插画', value: '扁平插画'},
];

const sizeOptions = [
  {label: '1024*1024', value: '1024*1024'},
  {label: '720*1280', value: '720*1280'},
  {label: '1280*720', value: '1280*720'},
];

interface IEasyEditRef {
  getValue: () => string;
  focus: () => void;
}

interface Props {
  onSubmit?: () => void;
  askMode?: boolean;
  value?: ImagePromptValue;
  onChange: (value: ImagePromptValue) => void;
}

const Component = forwardRef<IEasyEditRef, Props>(
  ({askMode, value = {desc: '', style: '默认', width: 1280, height: 720}, onChange, onSubmit}, ref): JSX.Element => {
    const descRef = useRef<any>();

    const onkeydown = useEvent((e: any) => {
      const {code} = e;
      if (code === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmit?.();
        }
      }
    });

    const onDescChange = useEvent((e: any) => {
      onChange({...value, desc: e.target.value.trim()});
    });

    const onStyleChange = useEvent((style: string) => {
      onChange({...value, style});
    });

    const onWidthChange = useEvent((width?: number | null) => {
      onChange({...value, width: width || undefined});
    });

    const onHeightChange = useEvent((height?: number | null) => {
      onChange({...value, height: height || undefined});
    });

    const onSizeChange = useEvent((size?: string | null) => {
      const [width, height] = size!.split('*');
      onChange({...value, width: Number(width) || undefined, height: Number(height) || undefined});
    });

    const focus = useEvent(() => {
      descRef.current.focus();
    });

    const getValue = useEvent(() => {
      return `生成图片：${value.desc}，风格为：${value.style}，大小为：${value.width}*${value.height}`;
    });

    useImperativeHandle(ref, () => ({getValue, focus}));

    return (
      <div className={styles.root} onKeyDown={onkeydown}>
        <div className="title">生成图片</div>
        <Input.TextArea ref={descRef} placeholder="请输入图片描述..." value={value.desc} onChange={onDescChange} />
        <div className="title">{askMode ? '风格' : '图片风格'}</div>
        <Select placeholder="请选择..." options={styleOptions} value={value.style} onChange={onStyleChange} />
        {askMode ? (
          <>
            <div className="title">大小</div>
            <Select
              placeholder="请选择..."
              options={sizeOptions}
              style={{width: 120}}
              value={value.width && value.height ? `${value.width}*${value.height}` : null}
              onChange={onSizeChange}
            />
          </>
        ) : (
          <>
            <div className="title">宽</div>
            <InputNumber min={1} max={1440} value={value.width} onChange={onWidthChange} />
            <div className="title">高</div>
            <InputNumber min={1} max={1440} value={value.height} onChange={onHeightChange} />
          </>
        )}
      </div>
    );
  }
);

export default memo(Component) as typeof Component;
