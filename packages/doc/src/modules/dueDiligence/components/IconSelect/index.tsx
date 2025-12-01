import {PlusOutlined} from '@ant-design/icons';
import {Upload, UploadFile, UploadProps} from 'antd';
import {FC, memo, useMemo, useRef, useState} from 'react';
import {getUploadProps} from '@/utils/request';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

const Icons: string[] = [
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48ZGVmcz48Y2xpcFBhdGggaWQ9Im1hc3Rlcl9zdmcwXzMwMF8zMzUxNSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTAuMzIyNTgwMzM3NTI0NDE0Ii8+PC9jbGlwUGF0aD48bGluZWFyR3JhZGllbnQgeDE9IjAuNSIgeTE9IjAiIHgyPSIwLjUiIHkyPSIxIiBpZD0ibWFzdGVyX3N2ZzFfMjkxXzIyNzcwIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNkY4Q0ZGIiBzdG9wLW9wYWNpdHk9IjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM1NDJGRkEiIHN0b3Atb3BhY2l0eT0iMSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNtYXN0ZXJfc3ZnMF8zMDBfMzM1MTUpIj48Zz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxMC4zMjI1ODAzMzc1MjQ0MTQiIGZpbGw9InVybCgjbWFzdGVyX3N2ZzFfMjkxXzIyNzcwKSIgZmlsbC1vcGFjaXR5PSIxIi8+PHJlY3QgeD0iMC41MTQ5OTk5ODU2OTQ4ODUzIiB5PSIwLjUxNDk5OTk4NTY5NDg4NTMiIHdpZHRoPSI2Mi45NzAwMDAwMjg2MTAyMyIgaGVpZ2h0PSI2Mi45NzAwMDAwMjg2MTAyMyIgcng9IjkuODA3NTgwMzUxODI5NTI5IiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSIxIiBzdHJva2U9IiNGRkZGRkYiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS4wMjk5OTk5NzEzODk3NzA1Ii8+PC9nPjxnPjxnPjxwYXRoIGQ9Ik0xNiw0NkMxNiw0Ny42NTY4NTMsMTcuMzQzMTQ1OCw0OSwxOS4wMDAwMDA1LDQ5TDQzLDQ5QzQ0LjY1Njg1NSw0OSw0Niw0Ny42NTY4NTMsNDYsNDZMNDYsMTYuMDAwMDAwNUM0NiwxNC4zNDMxNDU4LDQ0LjY1Njg1NSwxMyw0MywxM0wxOS4wMDAwMDA1LDEzQzE3LjM0MzE0NTgsMTMsMTYsMTQuMzQzMTQ1OCwxNiwxNi4wMDAwMDFMMTYsNDZaIiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjAuODAwMDAwMDExOTIwOTI5Ii8+PC9nPjxnIHRyYW5zZm9ybT0ibWF0cml4KC0xLDAsMCwxLDEwMiwwKSI+PHBhdGggZD0iTTUxLDQzQzUxLDQ0LjY1Njg1NSw1Mi4zNDMxNDU4LDQ2LDU0LjAwMDAwMDUsNDZMNTYsNDZMNTYsMTZMNTQuMDAwMDAwNSwxNkM1Mi4zNDMxNDU4LDE2LDUxLDE3LjM0MzE0NTgsNTEsMTkuMDAwMDAwNUw1MSw0M1oiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC40MTk5OTk5ODY4ODY5NzgxNSIvPjwvZz48Zz48cGF0aCBkPSJNMjEsMjAuNUMyMSwyMS4zMjg0MjcxLDIxLjY3MTU3Mjc0LDIyLDIyLjQ5OTk5OTksMjJMMzkuNSwyMkM0MC4zMjg0MjYsMjIsNDEsMjEuMzI4NDI3MSw0MSwyMC41QzQxLDE5LjY3MTU3Mjk4LDQwLjMyODQyNiwxOSwzOS41LDE5TDIyLjUsMTlDMjEuNjcxNTcyNzQsMTksMjEsMTkuNjcxNTcyOTgsMjEsMjAuNVoiIGZpbGw9IiM1NzUwRkYiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48Zz48cGF0aCBkPSJNMjEsMjcuNUMyMSwyOC4zMjg0MjcxLDIxLjY3MTU3Mjc0LDI5LDIyLjQ5OTk5OTksMjlMMzkuNSwyOUM0MC4zMjg0MjYsMjksNDEsMjguMzI4NDI3MSw0MSwyNy41QzQxLDI2LjY3MTU3Mjk4LDQwLjMyODQyNiwyNiwzOS41LDI2TDIyLjUsMjZDMjEuNjcxNTcyNzQsMjYsMjEsMjYuNjcxNTcyOTgsMjEsMjcuNVoiIGZpbGw9IiM1NzUwRkYiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48Zz48cGF0aCBkPSJNMjEsMzQuNUMyMSwzNS4zMjg0MjcxLDIxLjY3MTU3Mjc0LDM2LDIyLjQ5OTk5OTksMzZMMzkuNSwzNkM0MC4zMjg0MjYsMzYsNDEsMzUuMzI4NDI3MSw0MSwzNC41QzQxLDMzLjY3MTU3Mjk4LDQwLjMyODQyNiwzMywzOS41LDMzTDIyLjUsMzNDMjEuNjcxNTcyNzQsMzMsMjEsMzMuNjcxNTcyOTgsMjEsMzQuNVoiIGZpbGw9IiM1NzUwRkYiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48Zz48cGF0aCBkPSJNMjEsNDEuNUMyMSw0Mi4zMjg0MjcxLDIxLjY3MTU3Mjc0LDQzLDIyLjQ5OTk5OTksNDNMMjkuNSw0M0MzMC4zMjg0MjczLDQzLDMxLDQyLjMyODQyNzEsMzEsNDEuNUMzMSw0MC42NzE1NzI5OCwzMC4zMjg0MjczLDQwLDI5LjUsNDBMMjIuNSw0MEMyMS42NzE1NzI3NCw0MCwyMSw0MC42NzE1NzI5OCwyMSw0MS41WiIgZmlsbD0iIzU3NTBGRiIgZmlsbC1vcGFjaXR5PSIxIi8+PC9nPjwvZz48L2c+PC9zdmc+',
];

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
