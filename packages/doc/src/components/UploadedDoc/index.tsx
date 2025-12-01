import {CloseCircleFilled} from '@ant-design/icons';
import {Spin, UploadFile} from 'antd';
import {FC, memo} from 'react';
import EditIcon from '@/assets/images/edit';
import DocIcon from '@/assets/imgs/doc.svg';
import {openDoc} from '@/utils/request';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

const Component: FC<{file: UploadFile; onRemove?: () => void; onReplace?: () => void}> = ({file, onRemove, onReplace}) => {
  const onPreview = useEvent(() => {
    if (file.thumbUrl) {
      openDoc(file.thumbUrl);
    }
  });
  return (
    <div className={styles.root}>
      {file.status === 'uploading' && <Spin size="small" className="loading" />}
      <img src={DocIcon} onClick={onPreview} />
      <span className="name" onClick={onPreview}>
        {file.name.substring(0, 20)}
      </span>
      {onReplace && <EditIcon className="replace" onClick={onReplace} />}
      {onRemove && <CloseCircleFilled className="del" onClick={onRemove} />}
    </div>
  );
};

export default memo(Component);
