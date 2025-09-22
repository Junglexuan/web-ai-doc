import {Button, Modal, Spin} from 'antd';
import {FC, memo, useCallback, useEffect, useState} from 'react';
import {openArticle} from '@/utils/tools';
import DocAPI from '../../api';
import DocPreview from '../DocPreview';
import WordPreview from '../WordPreview';
import styles from './index.module.less';

interface Props {
  tplId: string;
  onCancel: () => void;
  onApply?: (tplId: string) => void;
}

const Component: FC<Props> = ({tplId, onCancel, onApply}) => {
  const [data, setData] = useState<{tplId: string; format?: string; snapshot: string; isMine: boolean}>();

  const copyForMe = useCallback(() => {
    DocAPI.copyTplForMe(tplId).then((id) => {
      onCancel();
      openArticle(`/admin/doc/item/tpl/${id}?__c=_dialog`);
    });
  }, [onCancel, tplId]);

  useEffect(() => {
    DocAPI.getTplPreview(tplId).then(setData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal open={true} footer={null} onCancel={onCancel} width={1200} mask={false} centered title="预览模版">
      <div className={styles.root}>
        {!data ? (
          <>
            <Spin />
            <div className="bd"></div>
            <div className="ft"></div>
          </>
        ) : (
          <>
            <div className="bd">{data.format === '2' ? <WordPreview url={data.snapshot} /> : <DocPreview content={data.snapshot} />}</div>
            <div className="ft">
              {data.isMine ? (
                <Button
                  onClick={() => {
                    onCancel();
                    openArticle(`/admin/doc/item/tpl/${tplId}?__c=_dialog`);
                  }}
                >
                  编辑模版
                </Button>
              ) : (
                <Button onClick={copyForMe}>复制为我的模版</Button>
              )}
              {onApply && (
                <Button
                  type="primary"
                  onClick={() => {
                    onCancel();
                    onApply(data.tplId);
                  }}
                >
                  立即使用
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default memo(Component);
