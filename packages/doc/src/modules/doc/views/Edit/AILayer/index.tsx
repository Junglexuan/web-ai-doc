import {IDomEditor} from '@wangeditor-next/editor';
import {Button, Spin} from 'antd';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {addClass, debounce, removeClass, useEvent} from '@/utils/tools';
import AIAsk from '../AIAsk';
import AIContinue from '../AIContinue';
import AICreate from '../AICreate';
import AIDialog from '../AIDialog';
import AIImage from '../AIImage';
import AIMenu, {MenuEvent, applicationTemplates, menuKeysMap, officialTemplates} from '../AIMenu';
import AIOutline from '../AIOutline';
import AIRobot from '../AIRobot';
import AIStylize from '../AIStylize';
import AIWeb from '../AIWeb';
import api, {RunningState} from '../api';
import styles from './index.module.less';
import type {AIEvent} from '../utils';

export interface IAIRef {
  closeMenu: (force?: boolean) => void;
  openMenu: (event: MenuEvent) => void;
  menuIsOpen: () => boolean;
  insertHtmlByAI: (html: string) => void;
  getTitle: () => string;
  getDocId: () => string;
  getContext: () => string;
  focusEditor: () => void;
}

interface Props {
  onCreated: (ref: IAIRef) => void;
  editor: IDomEditor;
}

const Component: FC<Props> = ({onCreated, editor}) => {
  const [aiEvent, setAIEvent] = useState<AIEvent>();
  const [menuEvent, setMenuEvent] = useState<MenuEvent>();
  const selMockRef = useRef<HTMLDivElement>();
  const [runningState, setRunningState] = useState<RunningState>('');

  const openMenu = useEvent((event: MenuEvent) => {
    //editor.blur();
    //setSelection(selection);
    setMenuEvent(event);
    setAIEvent(undefined);
    setTimeout(onDocScroll);
  });

  const closeMenu = useEvent((force?: boolean) => {
    if (runningState === 'Pending' || (runningState === 'Fulfilled' && !force)) {
      editor.blur();
      const dialog = document.getElementById('_ai_dialog');
      if (dialog) {
        const wrap = dialog.parentElement!.parentElement!;
        addClass(wrap, 'anmi');
        setTimeout(() => removeClass(wrap, 'anmi'), 200);
      }

      return;
    }
    setMenuEvent(undefined);
    setRunningState('');
    const placeholder = aiEvent?.placeholder;
    if (placeholder) {
      placeholder.parentNode?.removeChild(placeholder);
    }
    setAIEvent(undefined);
    const scroller = document.getElementById('_ai_editor_scroller')!;
    removeClass(scroller, 'on');
    editor.focus();
  });

  const menuIsOpen = useEvent(() => {
    return !!menuEvent;
  });

  const insertHtmlByAI = useEvent((html: string) => {
    if (!menuEvent?.selectionRange?.collapsed) {
      editor.deleteFragment();
    }
    editor.dangerouslyInsertHtml(html);
  });

  const getTitle = useEvent(() => {
    const input: HTMLInputElement = document.getElementById('_doc_title') as any;
    return input?.value;
  });

  const getDocId = useEvent(() => {
    const input: HTMLInputElement = document.getElementById('_doc_title') as any;
    return input?.getAttribute('data-doc') || '';
  });

  const getContext = useEvent(() => {
    return aiEvent!.context.replace(/\/$/g, '');
  });

  const focusEditor = useEvent(() => {
    editor.focus();
  });

  const onProofreadSuccess = useEvent(({content}: {content: string}) => {
    setRunningState('Fulfilled');
    closeMenu(true);
    const btn = document.getElementById('_ai_review_btn');
    if (btn) {
      btn.click();
    }
    if (content) {
      editor.setHtml(content);
    }
  });

  const onProofreadError = useEvent((data: any) => {
    console.log(data);
    setRunningState('Rejected');
    closeMenu(true);
  });

  const onDocScroll = useEvent(() => {
    const selectionRange = menuEvent?.selectionRange;
    if (selMockRef.current && selectionRange && !selectionRange.collapsed) {
      const rect = selectionRange.getBoundingClientRect();
      selMockRef.current.setAttribute('style', `width: ${rect.width}px; height: ${rect.height}px; left: ${rect.left}px; top: ${rect.top}px;`);
    }
  });

  const aiRef: IAIRef = useMemo(() => {
    return {openMenu, closeMenu, menuIsOpen, insertHtmlByAI, getTitle, getDocId, getContext, focusEditor};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aiDialog = useMemo(() => {
    if (!menuEvent) {
      return null;
    }
    if (aiEvent) {
      const aiKey = aiEvent.key;
      //校阅
      if (aiKey === 'X') {
        // const {controller, result} = api.proofread(aiRef.getDocId(), editor.getText(), editor.getHtml());
        // result.then(onProofreadSuccess, onProofreadError);
        // setRunningState('Pending');
        // return (
        //   <div className={styles.dialog}>
        //     <Spin />
        //     <div className="info">正在校阅</div>
        //     <Button size="small" onClick={() => controller.abort()}>
        //       取消
        //     </Button>
        //   </div>
        // );
        //setGlobalLoading(api.proofread(aiRef.getDocId(), editor.getText()), GetClientRouter().getActivePage().store);
      }
      if (aiKey === 'A') {
        return (
          <AIDialog event={aiEvent}>
            <AICreate aiRef={aiRef} onRunningStateChange={setRunningState} />
          </AIDialog>
        );
      }
      if (aiKey === 'C') {
        return (
          <AIDialog event={aiEvent}>
            <AIContinue aiRef={aiRef} onRunningStateChange={setRunningState} />
          </AIDialog>
        );
      }
      if (aiKey === 'O') {
        return (
          <AIDialog event={aiEvent}>
            <AIOutline aiRef={aiRef} onRunningStateChange={setRunningState} />
          </AIDialog>
        );
      }
      if (aiKey === 'T') {
        return (
          <AIDialog event={aiEvent}>
            <AIAsk aiRef={aiRef} onRunningStateChange={setRunningState} />
          </AIDialog>
        );
      }
      if (aiKey === 'K') {
        return (
          <AIDialog event={aiEvent}>
            <AIRobot aiRef={aiRef} onRunningStateChange={setRunningState} />
          </AIDialog>
        );
      }
      if (aiKey === 'W') {
        return (
          <AIDialog event={aiEvent}>
            <AIWeb aiRef={aiRef} onRunningStateChange={setRunningState} />
          </AIDialog>
        );
      }
      if (aiKey === 'P') {
        return (
          <AIDialog event={aiEvent}>
            <AIImage aiRef={aiRef} onRunningStateChange={setRunningState} />
          </AIDialog>
        );
      }
      if (aiKey === 'J' || aiKey === 'Z' || aiKey === 'F') {
        return (
          <AIDialog event={aiEvent}>
            <AIStylize
              title={aiKey === 'J' ? '精简内容' : aiKey === 'Z' ? '生成摘要' : '丰富内容'}
              aiRef={aiRef}
              onRunningStateChange={setRunningState}
            />
          </AIDialog>
        );
      }
      if (menuKeysMap.styles[aiKey]) {
        return (
          <AIDialog event={aiEvent}>
            <AIStylize title={menuKeysMap.styles[aiKey]} aiRef={aiRef} onRunningStateChange={setRunningState} />
          </AIDialog>
        );
      }
      if (menuKeysMap.official[aiKey]) {
        return (
          <AIDialog event={aiEvent}>
            sss
            {/* <AITemplate templateOptions={officialTemplates} template={showDialog!} aiRef={aiRef} onRunningStateChange={setRunningState} /> */}
          </AIDialog>
        );
      }
      if (menuKeysMap.application[aiKey]) {
        return (
          <AIDialog event={aiEvent}>
            sss
            {/* <AITemplate templateOptions={applicationTemplates} template={showDialog!} aiRef={aiRef} onRunningStateChange={setRunningState} /> */}
          </AIDialog>
        );
      }
    }
    return <AIMenu event={menuEvent} onCancel={closeMenu} onSelect={setAIEvent} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuEvent, aiEvent]);

  useEffect(() => {
    onCreated(aiRef);
    const scroller = document.getElementById('_ai_editor_scroller')!;
    const onScroll = debounce(onDocScroll, 100);
    scroller.addEventListener('scroll', onScroll);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!menuEvent) {
    return null;
  }

  return (
    <>
      {aiDialog}
      <div className={styles.mask + ' ' + runningState} onClick={() => closeMenu()}>
        <div id="_ai_sel_mock" ref={selMockRef as any}></div>
      </div>
    </>
  );
};

export default memo(Component);
