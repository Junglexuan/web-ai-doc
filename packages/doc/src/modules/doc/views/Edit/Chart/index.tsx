import {CloseOutlined, RobotOutlined} from '@ant-design/icons';
import {IDomEditor, SlateNode} from '@wangeditor-next/editor';
import {Button} from 'antd';
import {FC, memo, useEffect, useRef, useState} from 'react';
import {confirm, debounce, useEvent, useSingleWindow} from '@/utils/tools';
import styles from './index.module.less';
interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const [show, setShow] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null as any);

  useEffect(() => {
    const doc = document.getElementById('_ai_editor_scroller');
    const onResize = debounce(() => {
      const rect = doc!.getBoundingClientRect();
      const minWidth = window.innerWidth - rect.right;
      panelRef.current.style.width = Math.max(minWidth, 400) + 'px';
      //setPanelWidth(window.innerWidth / 2 - 275);
    }, 300);
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={panelRef} className={styles.panel + (show ? ' on' : '')}>
      <Button className={styles.close} size="small" icon={<CloseOutlined />} type="text" onClick={() => setShow(!show)} />
      <div className="bd">
        <iframe className={styles.iframe} src="http://www.baidu.com" />
      </div>
      <Button className={styles.button} icon={<RobotOutlined />} type="text" onClick={() => setShow(!show)} />
    </div>
  );
};

export default memo(Component);
