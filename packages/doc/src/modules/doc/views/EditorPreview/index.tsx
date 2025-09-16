import {FC, memo} from 'react';
import styles from './index.module.less';

interface Props {
  html: string;
}

const Component: FC<Props> = ({html}) => {
  return <div className={styles.root} dangerouslySetInnerHTML={{__html: html}} />;
};

export default memo(Component);
