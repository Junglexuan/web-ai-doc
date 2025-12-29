import {Button, Modal, Spin} from 'antd';
import {FC, memo, useCallback, useEffect, useState} from 'react';
import DocPreview from '@/modules/doc/views/DocPreview';
import WordPreview from '@/modules/doc/views/WordPreview';
import {openArticle} from '@/utils/tools';
import DocAPI from '../../api';
// import DocPreview from '../DocPreview';
// import WordPreview from '../WordPreview';
import styles from './index.module.less';

interface Props {
  tplData: {[key: string]: any};
  onCancel: () => void;
  onApply: () => void;
}

const Component: FC<Props> = ({tplData, onCancel, onApply}) => {
  const [data, setData] = useState<{[key: string]: any}>();
  const inDialog = location.search.endsWith('__c=_dialog');

  useEffect(() => {
    setData(tplData);
  }, [tplData]);

  return (
    <Modal
      open={true}
      footer={null}
      onCancel={onCancel}
      width={1200}
      centered
      rootClassName={inDialog ? 'g-dialog-no-mask' : undefined}
      title="预览模版"
    >
      <div className={styles.root}>
        {!data ? (
          <>
            <Spin />
            <div className="bd"></div>
            <div className="ft"></div>
          </>
        ) : (
          <>
            <div className="bd">
              <WordPreview url={tplData.url} />
            </div>
            <div className="ft">
              {
                <Button
                  type="primary"
                  onClick={() => {
                    onCancel();
                    onApply();
                  }}
                >
                  选择
                </Button>
              }
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default memo(Component);
