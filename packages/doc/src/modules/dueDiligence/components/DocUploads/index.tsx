import {Upload, UploadFile, UploadProps} from 'antd';
import {FC, memo, useMemo} from 'react';
import UploadButton from '@/components/UploadButton';
import UploadedDoc from '@/components/UploadedDoc';
import {getUploadProps} from '@/utils/request';
import {useEvent} from '@/utils/tools';

const customItemRender = (originNode: any, file: UploadFile, fileList: any, actions: any) => {
  return <UploadedDoc file={file} onRemove={actions.remove} />;
};

const Component: FC<{
  value?: UploadFile[];
  onChange?: (value?: UploadFile[]) => void;
}> = ({value = [], onChange}) => {
  const uploadProps: UploadProps = useMemo(() => getUploadProps('/api/upload/file'), []);

  const handleChange = useEvent(({fileList, file}: {fileList: UploadFile[]; file: UploadFile}) => {
    let newFileList = fileList;
    if (file.status === 'done') {
      const res = file.response.data;
      newFileList = fileList.map((item) => {
        if (item.uid === file.uid) {
          return {...item, url: res.url, thumbUrl: res.id};
        } else {
          return item;
        }
      });
    }
    onChange?.(newFileList);
  });

  return (
    <div>
      <Upload {...uploadProps} listType="picture-card" fileList={value} itemRender={customItemRender} onChange={handleChange}>
        <UploadButton />
      </Upload>
    </div>
  );
};

export default memo(Component);
