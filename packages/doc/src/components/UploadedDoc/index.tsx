import {CloseCircleFilled, SwapOutlined} from '@ant-design/icons';
import {Spin, UploadFile} from 'antd';
import {FC, memo} from 'react';
import DocIcon from '@/assets/imgs/doc.svg';
import styles from './index.module.less';

const Component: FC<{file: UploadFile; onRemove?: () => void; onReplace?: () => void}> = ({file, onRemove, onReplace}) => {
  return (
    <div className={styles.root}>
      {file.status === 'uploading' && <Spin size="small" className="loading" />}
      <img src={DocIcon} />
      <span className="name">{file.name.substring(0, 20)}</span>
      {onReplace && <SwapOutlined className="replace" onClick={onReplace} />}
      {onRemove && <CloseCircleFilled className="del" onClick={onRemove} />}
    </div>
  );
};

export default memo(Component);
