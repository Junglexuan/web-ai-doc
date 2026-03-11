import {Button, Modal, Spin, message} from 'antd';
import {FC, ReactElement, cloneElement, memo, useMemo, useState} from 'react';
import UploadedDoc from '@/components/UploadedDoc';
import {SitesUrl} from '@/Global';
import instance, {openDoc} from '@/utils/request';
import {showMask, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
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
  children?: ReactElement;
}> = ({value = {id: '', name: ''}, onChange, list, children}) => {
  const [showTpl, setShowTpl] = useState(false);

  const onCloseTpl = useEvent(() => {
    setShowTpl(false);
  });
  const onReplace = useEvent(() => {
    setShowTpl(true);
  });
  const onPreview = useEvent((item: TPL) => {
    const url = item.viewTemplateUrl || item.approveTemplateUrl;
    if (!url) {
      message.error('暂无预览地址');
      return;
    }
    DueDiligenceAPI.viewReportUrl(null, url).then((res) => {
      if (res.success && res.data) {
        window.open(res.data, '_blank');
      } else {
        message.error(res.message || '获取预览地址失败');
      }
    });
  });
  const onSelected = useEvent((item: TPL) => {
    setShowTpl(false);
    onChange?.({id: item.id, name: item.title});
  });

  return (
    <>
      {children ? (
        cloneElement(children, {onClick: onReplace})
      ) : (
        <UploadedDoc file={{uid: value.id, name: value.name, thumbUrl: value.id}} onReplace={onReplace} />
      )}
      {showTpl && (
        <Modal
          width={915}
          title="添加所需成果模板"
          open={true}
          footer={null}
          onCancel={() => {
            showMask(false);
            onCloseTpl();
          }}
          afterOpenChange={(open: boolean) => {
            showMask(open);
          }}
        >
          <div className={styles.root}>
            {list.map((item) => {
              return (
                <div key={item.id} className={styles.card}>
                  <div className={'title icon'}>{item.title}</div>
                  <div className="remark">{item.remark}</div>
                  {/* <div className="tags">
                    <span>{ShareOptions[item.isShare]}</span>
                  </div> */}
                  {/* <div className="creater">
                    <span>{`${item.createUserName} 创建于 ${item.createDate}`}</span>
                  </div> */}
                  <div title={item.remark} className="mask">
                    <div onClick={() => onPreview(item)}>预览</div>
                    <div onClick={() => onSelected(item)}>使用</div>
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
