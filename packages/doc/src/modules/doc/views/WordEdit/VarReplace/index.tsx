import {Button, Input, Space} from 'antd';
import {FC, memo, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import styles from './index.module.less';

interface Props {
  item: {type: string; title: string; remark: string; attribute: string; id: string};
  onCancel: () => void;
  onSubmit: (item: {type: string; title: string; attribute: string; id: string}) => void;
}

const Component: FC<Props> = ({onSubmit, onCancel, item}) => {
  const [fieldName, setFieldValue] = useState(item.title);
  const [remark, setRemark] = useState(item.remark);

  return (
    <div className={styles.root}>
      <h2>内容替换</h2>
      <div className="bd">
        <div className="title">
          <em>*</em>
          <span>名称：</span>
        </div>
        <Input
          className="field"
          placeholder="请给本词条取一个标识名称..."
          maxLength={15}
          value={fieldName}
          onChange={(e) => setFieldValue(e.target.value.trim())}
        />
        <div className="title">
          <span>描述：</span>
        </div>
        <Input
          className="field"
          placeholder="简要描述本词条的作用..."
          maxLength={15}
          value={remark}
          onChange={(e) => setRemark(e.target.value.trim())}
        />
        <div className="title">默认值：</div>
        <Input.TextArea placeholder="请输入默认值..." />
      </div>
      <div className="ft">
        <Button type="primary">确定</Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </div>
  );
};

export default memo(Component);
