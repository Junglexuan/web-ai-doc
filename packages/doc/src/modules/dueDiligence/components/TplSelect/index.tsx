import {Modal} from 'antd';
import {FC, memo, useState} from 'react';
import UploadedDoc from '@/components/UploadedDoc';
import {useEvent} from '@/utils/tools';
import {TPL} from '../../entity';
import styles from './index.module.less';

const ShareOptions: {[key: string]: string} = {
  '0': '个人使用',
  '1': '全员使用',
  '2': '网络公开',
};

const Component: FC<{
  value?: {id: string; name: string};
  onChange?: (value?: {id: string; name: string}) => void;
  list: TPL[];
}> = ({value = {id: '', name: ''}, onChange, list}) => {
  const [showTpl, setShowTpl] = useState(false);

  const onCloseTpl = useEvent(() => {
    setShowTpl(false);
  });
  const onReplace = useEvent(() => {
    setShowTpl(true);
  });
  const onPreview = useEvent((item: TPL) => {
    setShowTpl(false);
    console.log(item.url);
  });
  const onSelected = useEvent((item: TPL) => {
    setShowTpl(false);
    onChange?.({id: item.id, name: item.title});
  });

  return (
    <>
      <UploadedDoc file={{uid: value.id, name: value.name, thumbUrl: value.id}} onReplace={onReplace} />
      {showTpl && (
        <Modal width={915} title="添加所需成果模板" open={true} footer={null} onCancel={onCloseTpl}>
          <div className={styles.root}>
            {list.map((item) => {
              return (
                <div key={item.id} className={styles.card}>
                  <div className={'title icon'}>{item.title}</div>
                  <div className="remark">{item.remark}</div>
                  <div className="tags">
                    <span>{ShareOptions[item.isShare]}</span>
                  </div>
                  <div className="creater">
                    <span>{`${item.createUserName} 创建于 ${item.createDate}`}</span>
                  </div>
                  <div title={item.remark} className="mask">
                    <div onClick={() => onPreview(item)}>预览模板</div>
                    <div onClick={() => onSelected(item)}>确认添加</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </>
  );
};

export default memo(Component);
