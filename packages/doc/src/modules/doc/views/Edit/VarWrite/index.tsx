import {Button, Checkbox, Input} from 'antd';
import {FC, memo, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import WritePrompt, {WritePromptValue} from '../WritePrompt';
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
  const [fieldName, setFieldValue] = useState(elem.field);
  const [editable, setEditable] = useState(elem.editable);

  const onOk = useEvent(() => {
    if (value?.desc && fieldName) {
      onSubmit(elem, {source: formatValue(value), info: value.desc || '...', field: fieldName, editable});
    } else {
      message.error('请输入项目名称和AI提示词...');
    }
  });

  return (
    <div className={styles.root}>
      <div className="hd">
        <Checkbox className="allowInput" checked={editable} onChange={(e) => setEditable(e.target.checked)}>
          用户输入
        </Checkbox>
        <div className="formItem">
          <div className="label">
            <em>*</em>项目名称:
          </div>
          <Input
            className="input"
            placeholder="请给本词条取一个标识名称..."
            value={fieldName}
            onChange={(e) => setFieldValue(e.target.value.trim())}
          />
        </div>
      </div>
      <div className="bd">
        <WritePrompt value={value} onChange={setValue} />
      </div>
      <div className="dialogFooter">
        <Button size="small" type="primary" onClick={onOk}>
          确定
        </Button>
        <Button size="small" onClick={onOk}>
          格式
        </Button>
        <Button size="small" onClick={onCancel}>
          取消
        </Button>
      </div>
    </div>
  );
};

export default memo(Component);
