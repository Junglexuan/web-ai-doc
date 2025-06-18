import {CheckOutlined, PauseCircleOutlined, ReloadOutlined} from '@ant-design/icons';
import {IDomEditor} from '@wangeditor-next/editor';
import {Button} from 'antd';
import {marked} from 'marked';
import {FC, memo, useEffect, useRef, useState} from 'react';
import {KnowledgePrefix} from '@/Global';
import {debounce, getUrlParam, useEvent} from '@/utils/tools';
import AiAPI, {RunningState} from '../api';
import styles from './index.module.less';
interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const [runningState, setRunningState] = useState<RunningState>('');

  useEffect(() => {
    const tplId = getUrlParam('tpl');
    const tplData: {id: string; fields: {[key: string]: string}} = JSON.parse(window.sessionStorage.getItem('__temp_tpl__') || '{}');
    window.sessionStorage.removeItem('__temp_tpl__');
    if (tplId === tplData.id) {
      setRunningState('Pending');
      AiAPI.tpl(
        tplData,
        (html) => {
          console.log(html);
        },
        (e) => {
          setRunningState('Rejected');
        },
        () => {
          setRunningState('Fulfilled');
        }
      );
    }
  }, []);

  if (!runningState) {
    return null;
  }
  return (
    <>
      <div className={styles.dialog + ' ' + runningState}>
        <div className="wrap">
          {runningState === 'Pending' && (
            <>
              <span>生成中...</span>
              <Button className="stop" title="停止" size="small" type="text" icon={<PauseCircleOutlined />}></Button>
            </>
          )}
          {runningState !== 'Pending' && (
            <>
              <Button size="small" type="text" icon={<ReloadOutlined />}>
                重新生成
              </Button>
              <Button size="small" type="primary" icon={<CheckOutlined />}>
                确定
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={styles.mask}></div>
    </>
  );
};

export default memo(Component);
