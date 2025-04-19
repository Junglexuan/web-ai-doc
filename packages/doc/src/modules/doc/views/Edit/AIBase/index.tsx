import {CheckOutlined, DeleteOutlined, EditOutlined, PauseCircleOutlined, QuestionCircleFilled, SyncOutlined} from '@ant-design/icons';
import {Button, Space, Spin} from 'antd';
import {FC, ReactElement, memo, useEffect} from 'react';
import ColorAIcon from '../ColorAIcon';
import EnterIcon from '../EnterIcon';
import {AIDialogHooks} from '../hooks';
import styles from './index.module.less';

interface Props {
  title: string;
  children: ReactElement;
  hooks: AIDialogHooks;
  automatic?: boolean;
}

const Component: FC<Props> = ({title, children, hooks, automatic}) => {
  const {onPromptSubmit, inputRef, fragment, fragmentRef, runningState, onRedo, onKeep, onStop, onInsert} = hooks;

  useEffect(() => {
    if (automatic) {
      onPromptSubmit();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="_ai_dialog" className={styles.common + ' ' + runningState}>
      <ColorAIcon />
      <div className="input">
        <EnterIcon onClick={onPromptSubmit} />
        {children}
      </div>
      <div className="result">
        <Spin className="loading" size="small" />
        <div className="title">{inputRef.current?.getValue() || title}...</div>
        <Button size="small" className="pause-btn" type="text" icon={<PauseCircleOutlined />} onClick={onStop}>
          停止
        </Button>
        <div className="article" ref={fragmentRef as any} dangerouslySetInnerHTML={{__html: fragment}}></div>
      </div>
      <div className="footer">
        <Space size="small" className="actions">
          <Button type="primary" icon={<CheckOutlined />} onClick={onInsert}>
            插入
          </Button>
          <Button type="text" icon={<SyncOutlined />} onClick={onRedo}>
            换一换
          </Button>
          <Button type="text" icon={<EditOutlined />} onClick={onKeep}>
            继续写
          </Button>
          <Button type="text" icon={<DeleteOutlined />} onClick={hooks.aiRef.closeMenu}>
            弃用
          </Button>
        </Space>
        <div>
          <QuestionCircleFilled style={{color: '#aaa', cursor: 'pointer'}} />
        </div>
      </div>
    </div>
  );
};

export default memo(Component);
