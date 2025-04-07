import {Input} from 'antd';
import {FC, memo, useEffect, useMemo} from 'react';
import Prompt from '../Prompt';
import styles from './index.module.less';
interface Props {
  top: number;
}

const Component: FC<Props> = ({top}) => {
  return (
    <Prompt top={top} footer={true}>
      <div className={styles.root}>
        <Input.TextArea placeholder="请选择或输入指令，如：写一份工作报告" variant="borderless" autoSize prefix="%" />
      </div>
    </Prompt>
  );
};

export default memo(Component);
