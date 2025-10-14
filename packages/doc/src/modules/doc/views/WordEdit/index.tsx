import {ClockCircleOutlined, CloudUploadOutlined, HomeOutlined, StarFilled, StarOutlined, UserOutlined} from '@ant-design/icons';
import {Link} from '@elux/react-web';
import {Breadcrumb, Space} from 'antd';
import dayjs from 'dayjs';
import {FC, memo, useCallback, useMemo, useState} from 'react';
import DialogPage from '@/components/DialogPage';
import {GetClientRouter} from '@/Global';
import DocAPI from '../../api';
import {ItemDetail} from '../../entity';
import WordPreview from '../WordPreview';
import styles from './index.module.less';
import VarReplace from './VarReplace';
interface Props {
  itemDetail: ItemDetail;
}

const Component: FC<Props> = ({itemDetail}) => {
  const [docTitle, setDocTitle] = useState(itemDetail.title);
  const [collect, setCollect] = useState(itemDetail.collect);
  const [wordPlugin, setWordPlugin] = useState(itemDetail.wordPlugin || []);
  const [currentTag, setCurrentTag] = useState<{type: string; title: string; attribute: string; id: string}>();

  const breadcrumb = useMemo(() => {
    return (
      <Breadcrumb
        items={[
          {
            title: (
              <Link to="/admin/doc/list/tpls" action="relaunch" target="window">
                模版管理
              </Link>
            ),
          },
          {
            title: (
              <>
                <span>{docTitle}</span>
                {!collect ? (
                  <StarOutlined
                    className="anticon-star-outline"
                    onClick={() => DocAPI.collectItem(itemDetail.id, itemDetail.docType, true).then(() => setCollect(1))}
                  />
                ) : (
                  <StarFilled onClick={() => DocAPI.collectItem(itemDetail.id, itemDetail.docType, false).then(() => setCollect(0))} />
                )}
              </>
            ),
          },
        ]}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docTitle, collect]);

  const onClose = useCallback(() => {
    setCurrentTag(undefined);
  }, []);

  const onSubmitTag = useCallback(
    (item: {type: string; title: string; attribute: string; id: string}) => {
      onClose();
    },
    [onClose]
  );

  return (
    <DialogPage size="max" maskClosable={false} showControls={false} showClose={false}>
      <div className={styles.root}>
        <div className="hd">
          <Space size="large">
            <HomeOutlined className="icon-link" onClick={() => GetClientRouter().relaunch({url: `/admin/home`}, 'window')} />
            {breadcrumb}
          </Space>
          <Space align="center" className="info">
            {itemDetail.readonly && <span>只读模式</span>}
            <div>
              <UserOutlined />
              <span> {itemDetail.createUserName}</span>
            </div>
            <div>
              <ClockCircleOutlined />
              <span> {itemDetail.createDate ? dayjs(itemDetail.createDate).format('YYYY-MM-DD HH:mm:ss') : ''} 创建</span>
            </div>
            <CloudUploadOutlined />
          </Space>
        </div>
        <div className="bd">
          <div className="left">
            <h2 className="tag-title">模版配置</h2>
            <ul className="tag-list">
              {wordPlugin.map((item) => {
                return (
                  <li key={item.id} className="tag" onClick={() => setCurrentTag(item)}>
                    <span title={item.title}>{item.title}</span>
                    <span>内容替换</span>
                    <span></span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="right">
            <WordPreview url={itemDetail.contents} />
          </div>
        </div>
      </div>
      {currentTag && (
        <>
          <div className={styles.mask} onClick={onClose}></div>
          <div className={styles.dailog}>
            <div className="wrap">
              <VarReplace item={currentTag} onCancel={onClose} onSubmit={onSubmitTag} />
            </div>
          </div>
        </>
      )}
    </DialogPage>
  );
};

export default memo(Component);
