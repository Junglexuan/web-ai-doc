import {Button, Input, Space} from 'antd';
import {FC, memo, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import styles from './index.module.less';

function matchValue(code: string): string {
  const arr = code.match(/ASK\((.+?)\)/) || [];
  return arr[1]?.slice(1, -1) || '';
}

const TPL = '${KNOWLEDGE.ASK(***)}';

interface Props {
  onCancel: () => void;
  onSubmit: (elem: VariableElement, update: Partial<VariableElement>) => void;
  elem: VariableElement;
}

const Component: FC<Props> = ({onSubmit, onCancel, elem}) => {
  const [value, setValue] = useState(matchValue(decodeURI(elem.source)));

  const onInputChange = useEvent((e: any) => {
    setValue(e.target.value.trim());
  });

  const onOk = useEvent(() => {
    if (value) {
      onSubmit(elem, {source: TPL.replace('(***)', `('${encodeURI(value)}')`)});
    } else {
      message.error('请输入问题...');
    }
  });

  return (
    <div className={styles.root}>
      <div className="bd">
        <div className="title">图片描述：</div>
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
