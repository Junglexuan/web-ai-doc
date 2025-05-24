import {Button, Space} from 'antd';
import {FC, memo, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import ImagePrompt, {WritePromptValue} from '../WritePrompt';
import styles from './index.module.less';

const TPL = '${AI.ASK(***)}';

function matchValue(code: string): WritePromptValue | undefined {
  const arr = code.match(/ASK\((.+)\)\}$/) || [];
  let args = arr[1]?.slice(1, -1) || '';
  if (args) {
    args = decodeURI(args);
    let value: any;
    try {
      value = JSON.parse(args);
    } catch (error) {
      value = undefined;
    }
    return value;
  }
  return undefined;
}

function formatValue(value: any): string {
  if (value) {
    value = JSON.stringify(value);
    return TPL.replace('(***)', `('${encodeURI(value)}')`);
  }
  return '';
}

interface Props {
  onCancel: () => void;
  onSubmit: (elem: VariableElement, update: Partial<VariableElement>) => void;
  elem: VariableElement;
}

const Component: FC<Props> = ({onSubmit, onCancel, elem}) => {
  const [value, setValue] = useState(() => matchValue(elem.source));

  const onOk = useEvent(() => {
    if (value?.desc) {
      onSubmit(elem, {source: formatValue(value)});
    } else {
      message.error('请输入内容描述...');
    }
  });

  return (
    <div className={styles.root}>
      <div className="bd">
        <ImagePrompt value={value} onChange={setValue} />
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
