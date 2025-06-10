import {Button, Input, Space} from 'antd';
import {FC, memo, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import styles from './index.module.less';

const TPL = '${DOC.REPLACE(***)}';

function matchValue(code: string): string {
  const arr = code.match(/REPLACE\((.+)\)\}$/) || [];
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
  const [fieldName, setFieldValue] = useState(elem.field);

  const onInputChange = useEvent((e: any) => {
    setValue(e.target.value.trim());
  });

  const onOk = useEvent(() => {
    if (fieldName) {
      onSubmit(elem, {source: formatValue(value), info: value || '...', field: fieldName});
    } else {
      message.error('请输入字段定义...');
    }
  });

  return (
    <div className={styles.root}>
      <div className="bd">
        <div className="title">
          <em>*</em>
          <span>字段定义：</span>
        </div>
        <Input className="field" placeholder="显示给用户的字段名称" value={fieldName} onChange={(e) => setFieldValue(e.target.value.trim())} />
        <div className="title">内容描述：</div>
        <Input.TextArea placeholder="请输入内容描述..." value={value} onChange={onInputChange} />
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
