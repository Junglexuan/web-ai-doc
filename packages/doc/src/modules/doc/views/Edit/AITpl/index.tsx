import {PauseCircleOutlined, ReloadOutlined} from '@ant-design/icons';
import {IDomEditor} from '@wangeditor-next/editor';
import {Button, Spin} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {addClass, getUrlParam, removeClass, throttle} from '@/utils/tools';
import AiAPI, {RunningState} from '../api';
import styles from './index.module.less';
interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const [runningState, setRunningState] = useState<RunningState>('');
  const [tplData] = useState(() => {
    const tplId = getUrlParam('tpl');
    const tplData: {id: string; fields: {[key: string]: string}} = JSON.parse(window.sessionStorage.getItem('__temp_tpl__') || '{}');
    window.sessionStorage.removeItem('__temp_tpl__');
    return tplId === tplData.id ? tplData : null;
  });
  const requestRef = useRef<AbortController>();
  const dialogDivRef = useRef<HTMLElement>(null as any);
  const tmpDivRef = useRef<HTMLElement>(null as any);

  const onStop = useCallback(() => {
    requestRef.current?.abort();
    setTimeout(() => {
      setRunningState('Fulfilled');
    });
  }, []);

  const onClose = useCallback(() => setRunningState(''), []);

  const insertHtml = useMemo(() => {
    return throttle((html: string) => {
      console.log(html);
      tmpDivRef.current.innerHTML = html
        .replace(/<body>|<\/body>/g, '')
        .replace(/\n/g, '')
        .trim();
      //console.log(tmpDivRef.current.innerHTML);
      editor.setHtml(tmpDivRef.current.innerHTML);
      editor.focus();
      editor.move(999999999);
    }, 500);
  }, [editor]);

  const retry = useCallback(() => {
    if (tplData) {
      setRunningState('Pending');

      requestRef.current = AiAPI.tpl(
        tplData,
        insertHtml,
        (e) => {
          setRunningState('Rejected');
        },
        () => {
          setRunningState('Fulfilled');
        }
      );
    }
  }, [insertHtml, tplData]);

  const onMaskClick = useCallback(() => {
    addClass(dialogDivRef.current!, 'anmi');
    setTimeout(() => removeClass(dialogDivRef.current!, 'anmi'), 200);
  }, []);

  useEffect(() => {
    retry();
  }, [retry]);

  if (!runningState) {
    return null;
  }
  return (
    <>
      <div ref={dialogDivRef as any} className={styles.dialog + ' ' + runningState}>
        <div className="wrap">
          {runningState === 'Pending' && (
            <>
              <Spin size="small" />
              <span>AI生成中...</span>
              <Button className="stop" title="停止" size="small" type="text" icon={<PauseCircleOutlined />} onClick={onStop}></Button>
            </>
          )}
          {runningState !== 'Pending' && (
            <>
              <Button size="small" type="text" icon={<ReloadOutlined />} onClick={retry}>
                重新生成
              </Button>
              <Button size="small" type="primary" onClick={onClose}>
                确定
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={styles.mask} onClick={onMaskClick}></div>
      <div ref={tmpDivRef as any} className={styles.temp}></div>
    </>
  );
};

export default memo(Component);
