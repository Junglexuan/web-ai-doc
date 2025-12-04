import {CloseOutlined} from '@ant-design/icons';
import {IDomEditor} from '@wangeditor-next/editor';
import {marked} from 'marked';
import {FC, memo, useEffect, useRef, useState} from 'react';
import {SitesUrl} from '@/Global';
import {debounce, getToken, isIframe, useEvent} from '@/utils/tools';
import styles from './index.module.less';
interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const [show, setShow] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null as any);

  const insertMessage = useEvent((md: string) => {
    const html = marked.parse(md) as string;
    editor.dangerouslyInsertHtml(html);
  });

  useEffect(() => {
    const doc = document.getElementById('_ai_editor_scroller');
    const onResize = debounce(() => {
      const rect = doc!.getBoundingClientRect();
      const minWidth = window.innerWidth - rect.right;
      panelRef.current.style.width = Math.max(minWidth, 500) + 'px';
      //setPanelWidth(window.innerWidth / 2 - 275);
    }, 300);
    onResize();
    const onMessage = (e: any) => {
      const {action, content}: {action: string; content: string} = e.data || {};
      if (action === 'chat-insert' && content) {
        insertMessage(content);
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <>
      <div className={styles.button} onClick={() => setShow(!show)}>
        智能体
      </div>
      <span id="_ai_chart_btnClose" style={{display: 'none'}} onClick={() => setShow(false)} />
      <div ref={panelRef} className={styles.panel + (show ? ' on' : '')}>
        <span className={styles.close} onClick={() => setShow(!show)}>
          <CloseOutlined />
        </span>
        {/* url = `${authorizationUtil.getZovMsgOrigin() ?? ''}/app?path=${
        encodeURIComponent(`${location.origin}${UMI_APP_ROUTE_BASE}knowledge/${KnowledgeRouteKey.Dataset}?id=${item.id}&from=list`)}` */}
        {/* {isIframe() ? ( */}
        <iframe
          className={styles.iframe}
          src={`${localStorage.getItem('zov-msg-origin') ?? ''}/app?path=${encodeURIComponent(`${SitesUrl.pulse}/chat/window?token=${getToken()}`)}`}
        />
        {/* ) : (
          <div className="bd">{show && <iframe className={styles.iframe} src={`${SitesUrl.pulse}/chat/window?token=${getToken()}`} />}</div>
        )} */}
      </div>
    </>
  );
};

export default memo(Component);
