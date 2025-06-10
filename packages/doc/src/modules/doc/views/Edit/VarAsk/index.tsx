import {Button, Input, Space} from 'antd';
import {FC, memo, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import styles from './index.module.less';

const TPL = '${KNOWLEDGE.ASK(***)}';

function matchValue(code: string): string {
  const arr = code.match(/ASK\((.+)\)\}$/) || [];
  const args = arr[1]?.slice(1, -1) || '';
  return decodeURI(args);
}
function formatValue(value: string): string {
  return TPL.replace('(***)', `('${encodeURI(value)}')`);
}

interface Props {
  onCancel: () => void;
  onSubmit: (elem: VariableElement, update: Partial<VariableElement>) => void;
  elem: VariableElement;
}

const Component: FC<Props> = ({onSubmit, onCancel, elem}) => {
  const [value, setValue] = useState(() => matchValue(elem.source));

  const onInputChange = useEvent((e: any) => {
    setValue(e.target.value.trim());
  });

  const onOk = useEvent(() => {
    if (value) {
      onSubmit(elem, {source: formatValue(value), info: value || '...'});
    } else {
      message.error('请输入问题...');
    }
  });

  return (
    <div className={styles.root}>
      <div className="bd">
        <div className="title">问题描述：</div>
        <Input.TextArea placeholder="请输入问题..." value={value} onChange={onInputChange} />
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
