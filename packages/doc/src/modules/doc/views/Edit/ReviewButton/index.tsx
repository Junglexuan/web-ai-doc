import {FileProtectOutlined} from '@ant-design/icons';
import {IDomEditor} from '@wangeditor-next/editor';
import {Button} from 'antd';
import {FC, memo} from 'react';
import styles from './index.module.less';
//import './registerMenu';

interface Props {
  editor: IDomEditor;
  onClick?: () => void;
}

const Component: FC<Props> = ({editor, onClick}) => {
  return (
    <>
      <div className="w-e-bar-divider"></div>
      <Button
        disabled={editor.getConfig().readOnly}
        id="_ai_review_btn"
        className={styles.button}
        type="text"
        icon={<FileProtectOutlined />}
        onClick={onClick}
      >
        校阅
      </Button>
    </>
  );
};

export default memo(Component);
