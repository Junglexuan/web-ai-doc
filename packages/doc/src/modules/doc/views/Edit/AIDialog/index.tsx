import {QuestionCircleFilled} from '@ant-design/icons';
import {FC, ReactNode, memo} from 'react';
import styles from './index.module.less';

interface Props {
  top: number;
  children: ReactNode;
  footer: ReactNode;
}

const Component: FC<Props> = ({top, children, footer}) => {
  return (
    <div className={styles.dialog} style={top < 0 ? {top: 'auto', bottom: -top} : {top, bottom: 'auto'}}>
      <div className="wrap">{children}</div>
      <div className={'arrow' + (top < 0 ? '' : ' on')}></div>
    </div>
  );
};

export default memo(Component);
