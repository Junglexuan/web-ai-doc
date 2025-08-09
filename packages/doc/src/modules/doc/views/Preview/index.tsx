import {Editor} from '@wangeditor-next/editor-for-react';
import {Button, Modal} from 'antd';
import {FC, memo} from 'react';
import styles from './index.module.less';

interface Props {
  data: {tplId: string; snapshot: string; isMine: boolean};
  onCancel: () => void;
  onApply?: (tplId: string) => void;
}

const Component: FC<Props> = ({data, onCancel, onApply}) => {
  return (
    <Modal open={true} footer={null} onCancel={onCancel} width={1200} maskClosable={false} title="预览模版">
      <div className={styles.root}>
        <div className="bd">
          <Editor
            defaultConfig={{readOnly: true}}
            value={`<p style="line-height: 1.5;">农家小炒肉的做法农家小炒肉的做法农家小炒肉的做法农家小炒肉的做法</p>`}
            //style={{minHeight: '500px'}}
            mode="simple"
          />
        </div>
        <div className="ft">
          {data.isMine ? <Button>编辑模版</Button> : <Button>复制为我的模版</Button>}
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
      </div>
    </Modal>
  );
};

export default memo(Component);
