import {PlusOutlined} from '@ant-design/icons';
import {Upload, UploadFile, UploadProps} from 'antd';
import {FC, memo, useMemo, useRef, useState} from 'react';
import {getUploadProps} from '@/utils/request';
import {useEvent} from '@/utils/tools';
import Icons from './icons';
import styles from './index.module.less';

const Component: FC<{
  value?: string;
  onChange?: (value?: string) => void;
}> = ({value, onChange}) => {
  const uploadFileUrl = useRef('');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const uploadProps: UploadProps = useMemo(() => getUploadProps('/api/upload/file'), []);

  const handleChange = useEvent(({fileList, file}: {fileList: UploadFile[]; file: UploadFile}) => {
    setUploadFiles(fileList);
    if (file.status === 'done') {
      const url = file.response.data.url;
      uploadFileUrl.current = url;
      onChange?.(url);
    }
  });

  return (
    <div className={styles.root}>
      <div className={value === Icons[0] ? 'on' : ''} onClick={() => onChange?.(Icons[0])}>
        <img src={Icons[0]} />
      </div>
      <div className={value === Icons[1] ? 'on' : ''} onClick={() => onChange?.(Icons[1])}>
        <img src={Icons[1]} />
      </div>
      <div className={value === Icons[2] ? 'on' : ''} onClick={() => onChange?.(Icons[2])}>
        <img src={Icons[2]} />
      </div>
      <div className={value === Icons[3] ? 'on' : ''} onClick={() => onChange?.(Icons[3])}>
        <img src={Icons[3]} />
      </div>
      <div className={value === Icons[4] ? 'on' : ''} onClick={() => onChange?.(Icons[4])}>
        <img src={Icons[4]} />
      </div>
      <div
        className={value === uploadFileUrl.current ? 'upload on' : 'upload'}
        onClick={() => uploadFileUrl.current && onChange?.(uploadFileUrl.current)}
      >
        <Upload {...uploadProps} listType="picture-card" fileList={uploadFiles} onChange={handleChange}>
          {uploadFiles.length > 0 ? null : (
            <div className="upload-btn">
              <PlusOutlined />
            </div>
          )}
        </Upload>
      </div>
      <div className={value === Icons[5] ? 'on' : ''} onClick={() => onChange?.(Icons[5])}>
        <img src={Icons[5]} />
      </div>
      <div className={value === Icons[6] ? 'on' : ''} onClick={() => onChange?.(Icons[6])}>
        <img src={Icons[6]} />
      </div>
      <div className={value === Icons[7] ? 'on' : ''} onClick={() => onChange?.(Icons[7])}>
        <img src={Icons[7]} />
      </div>
      <div className={value === Icons[8] ? 'on' : ''} onClick={() => onChange?.(Icons[8])}>
        <img src={Icons[8]} />
      </div>
      <div className={value === Icons[9] ? 'on' : ''} onClick={() => onChange?.(Icons[9])}>
        <img src={Icons[9]} />
      </div>
      <div style={{visibility: 'hidden'}}></div>
    </div>
  );
};

export default memo(Component);
