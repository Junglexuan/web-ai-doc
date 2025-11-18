import {Button, Input, Space} from 'antd';
import {FC, memo, useState} from 'react';
import {message, readClipboardHTML, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import styles from './index.module.less';

export type DataSource = {
  field: string;
  default: string;
  remark?: string;
};

const TPL = '${DOC.REPLACE(***)}';

const defaultDataSource: DataSource = {field: '', default: ''};

function matchValue(code: string): DataSource | undefined {
  const arr = code.match(/REPLACE\((.+)\)\}$/) || [];
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

function formatValue(data: DataSource): string {
  if (data) {
    const value = JSON.stringify(data);
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
  const [dataSource, setDataSource] = useState(() => matchValue(elem.source) || defaultDataSource);

  const onOk = useEvent(() => {
    if (dataSource.default && dataSource.field) {
      onSubmit(elem, {source: formatValue(dataSource), info: dataSource.default, field: dataSource.field});
    } else {
      message.error('请输入名称和默认值...');
    }
  });

  return (
    <div className={styles.root}>
      <div className="bd">
        <div className="title">
          <em>*</em>
          <span>名称：</span>
        </div>
        <Input
          className="field"
          placeholder="请给本词条取一个标识名称..."
          value={dataSource.field}
          maxLength={15}
          onChange={(e) => setDataSource({...dataSource, field: e.target.value.trim()})}
        />
        <div className="title">
          <span>描述：</span>
        </div>
        <Input
          className="field"
          placeholder="简要描述该词条的作用..."
          value={dataSource.remark}
          maxLength={256}
          onChange={(e) => setDataSource({...dataSource, remark: e.target.value.trim()})}
        />
        <div className="title">
          <em>*</em>
          <span>默认值：</span>
        </div>
        <Input.TextArea
          placeholder="请输入默认值..."
          value={dataSource.default}
          onChange={(e) => setDataSource({...dataSource, default: e.target.value})}
        />
      </div>
      <div className="dialogFooter">
        <Button size="small" onClick={onCancel}>
          取消
        </Button>
        <Button size="small" type="primary" onClick={onOk}>
          确定
        </Button>
      </div>
    </div>
  );
};

export default memo(Component);
