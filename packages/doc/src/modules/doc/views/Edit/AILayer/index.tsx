import {IDomEditor} from '@wangeditor-next/editor';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import {message, removeClass, useEvent} from '@/utils/tools';
import AIAsk from '../AIAsk';
import AIContinue from '../AIContinue';
import AICreate from '../AICreate';
import AIDialog from '../AIDialog';
import AIMenu, {applicationTemplates, menuKeysMap, officialTemplates} from '../AIMenu';
import AIOutline from '../AIOutline';
import AIStylize from '../AIStylize';
import {RunningState} from '../api';
import styles from './index.module.less';
import type {ISelection} from '../utils';

export interface IAIRef {
  closeMenu: () => void;
  openMenu: (selection: ISelection | undefined) => void;
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
  const [selection, setSelection] = useState<ISelection>();
  const [showDialog, setShowDialog] = useState<string>();
  const [runningState, setRunningState] = useState<RunningState>('');

  const openMenu = useEvent((selection: ISelection | undefined) => {
    editor.blur();
    console.log(selection);
    setSelection(selection);
    setShowDialog(undefined);
  });

  const closeMenu = useEvent(() => {
    if (runningState === 'Pending') {
      message.warning('正在执行...请先停止当前任务!');
      editor.blur();
      return;
    }
    setSelection(undefined);
    setShowDialog(undefined);
    const placeholder = selection?.placeholder;
    if (placeholder) {
      placeholder.parentNode?.removeChild(placeholder);
    }
    const scroller = document.getElementById('_ai_editor_scroller')!;
    removeClass(scroller, 'on');
    editor.focus();
  });

  const menuIsOpen = useEvent(() => {
    return !!selection;
  });

  const insertHtmlByAI = useEvent((html: string) => {
    if (selection?.context.endsWith('/')) {
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
    return selection!.context.replace(/\/$/g, '');
  });

  const focusEditor = useEvent(() => {
    editor.focus();
  });

  const aiRef: IAIRef = useMemo(() => {
    return {openMenu, closeMenu, menuIsOpen, insertHtmlByAI, getTitle, getDocId, getContext, focusEditor};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aiDialog = useMemo(() => {
    if (!selection) {
      return null;
    }
    if (showDialog === 'A') {
      return (
        <AIDialog selection={selection} footer={true}>
          <AICreate aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (showDialog === 'C') {
      return (
        <AIDialog selection={selection} footer={true}>
          <AIContinue aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (showDialog === 'O') {
      return (
        <AIDialog selection={selection} footer={true}>
          <AIOutline aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (showDialog === 'T') {
      return (
        <AIDialog selection={selection} footer={true}>
          <AIAsk aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (showDialog === 'J' || showDialog === 'Z' || showDialog === 'F') {
      return (
        <AIDialog selection={selection} footer={true}>
          <AIStylize
            title={showDialog === 'J' ? '精简内容' : showDialog === 'Z' ? '生成摘要' : '丰富内容'}
            aiRef={aiRef}
            onRunningStateChange={setRunningState}
          />
        </AIDialog>
      );
    }
    if (menuKeysMap.styles[showDialog || '']) {
      return (
        <AIDialog selection={selection} footer={true}>
          <AIStylize title={menuKeysMap.styles[showDialog || '']} aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (menuKeysMap.official[showDialog || '']) {
      return (
        <AIDialog selection={selection} footer={true}>
          sss
          {/* <AITemplate templateOptions={officialTemplates} template={showDialog!} aiRef={aiRef} onRunningStateChange={setRunningState} /> */}
        </AIDialog>
      );
    }
    if (menuKeysMap.application[showDialog || '']) {
      return (
        <AIDialog selection={selection} footer={true}>
          sss
          {/* <AITemplate templateOptions={applicationTemplates} template={showDialog!} aiRef={aiRef} onRunningStateChange={setRunningState} /> */}
        </AIDialog>
      );
    }

    return <AIMenu selection={selection} onSelect={setShowDialog} onCancel={closeMenu} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDialog, selection]);

  useEffect(() => {
    onCreated(aiRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selection) {
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
