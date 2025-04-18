import {IDomEditor} from '@wangeditor-next/editor';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import {message, removeClass, useEvent} from '@/utils/tools';
import AIAsk from '../AIAsk';
import AIContinue from '../AIContinue';
import AICreate from '../AICreate';
import AIDialog from '../AIDialog';
import AIMenu, {MenuEvent, applicationTemplates, menuKeysMap, officialTemplates} from '../AIMenu';
import AIOutline from '../AIOutline';
import AIStylize from '../AIStylize';
import {RunningState} from '../api';
import styles from './index.module.less';
import type {AIEvent} from '../utils';

export interface IAIRef {
  closeMenu: () => void;
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
  const [runningState, setRunningState] = useState<RunningState>('');

  const openMenu = useEvent((event: MenuEvent) => {
    //editor.blur();
    //setSelection(selection);
    setMenuEvent(event);
    setAIEvent(undefined);
  });

  const closeMenu = useEvent(() => {
    if (runningState === 'Pending') {
      message.warning('正在执行...请先停止当前任务!');
      editor.blur();
      return;
    }
    setMenuEvent(undefined);
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
    if (aiEvent?.context.endsWith('/')) {
      editor.deleteBackward('character');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!menuEvent) {
    return null;
  }

  return (
    <>
      {aiDialog}
      <div className={styles.mask + ' ' + runningState} onClick={closeMenu}></div>
    </>
  );
};

export default memo(Component);
