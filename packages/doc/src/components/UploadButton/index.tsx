import {FC, memo} from 'react';
import UploadIcon from '@/assets/imgs/upload.svg';
import styles from './index.module.less';

const Component: FC<{label?: string}> = ({label}) => {
  return (
    <div className={styles.root}>
      <img src={UploadIcon} width={24} height={21} />
      <span>{label || '上传文件'}</span>
    </div>
  );
};

export default memo(Component);
