import {PlusOutlined} from '@ant-design/icons';
import {Upload, UploadFile, UploadProps} from 'antd';
import {FC, memo, useMemo, useRef, useState} from 'react';
import {getUploadProps} from '@/utils/request';
import {useEvent} from '@/utils/tools';
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
      <div className={value === 'aaa.png' ? 'on' : ''} onClick={() => onChange?.('aaa.png')}>
        <img src="" />
      </div>
      <div className={value === 'bbb.png' ? 'on' : ''} onClick={() => onChange?.('bbb.png')}>
        <img src="" />
      </div>
      <div className={value === 'ccc.png' ? 'on' : ''} onClick={() => onChange?.('ccc.png')}>
        <img src="" />
      </div>
      <div className={value === 'ddd.png' ? 'on' : ''} onClick={() => onChange?.('ddd.png')}>
        <img src="" />
      </div>
      <div className={value === 'eee.png' ? 'on' : ''} onClick={() => onChange?.('eee.png')}>
        <img src="" />
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
      <div className={value === 'fff.png' ? 'on' : ''} onClick={() => onChange?.('fff.png')}>
        <img src="" />
      </div>
      <div className={value === 'ggg.png' ? 'on' : ''} onClick={() => onChange?.('ggg.png')}>
        <img src="" />
      </div>
      <div className={value === 'hhh.png' ? 'on' : ''} onClick={() => onChange?.('hhh.png')}>
        <img src="" />
      </div>
      <div className={value === 'iii.png' ? 'on' : ''} onClick={() => onChange?.('iii.png')}>
        <img src="" />
      </div>
      <div className={value === 'jjj.png' ? 'on' : ''} onClick={() => onChange?.('jjj.png')}>
        <img src="" />
      </div>
      <div style={{visibility: 'hidden'}}></div>
    </div>
  );
};

export default memo(Component);
