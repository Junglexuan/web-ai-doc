import {Boot, IDomEditor, IModalMenu, SlateNode} from '@wangeditor-next/editor';
import {FC, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import AIContinue from '../AIContinue';
import AICreate from '../AICreate';
import AIDialog from '../AIDialog';
import AIMenu, {MenuHeight, applicationTemplates, officialTemplates} from '../AIMenu';
import AIOutline from '../AIOutline';
import AITemplate from '../AITemplate';
import {RunningState} from '../api';
import styles from './index.module.less';

export interface ISelection {
  pos: {x: number; y: number};
  context: string;
}

export interface IAIRef {
  closeMenu: () => void;
  openMenu: (selection: ISelection | undefined) => void;
  menuIsOpen: () => boolean;
  insertHtmlByAI: (html: string) => void;
  getTitle: () => string;
  getDocId: () => string;
  getContext: () => string;
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
    editor.focus();
  });

  const menuIsOpen = useEvent(() => {
    return !!selection;
  });

  const insertHtmlByAI = useEvent((html: string) => {
    const domSelection = document.getSelection();
    const curText = domSelection?.anchorNode?.textContent || '';
    const indexText = domSelection?.anchorOffset || 0;
    console.log(curText, indexText);
    if (curText.charAt(indexText - 1) === '/') {
      editor.deleteBackward('character');
    }
    editor.dangerouslyInsertHtml(html);
    //return editor.dangerouslyInsertHtml(html);
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
    return selection!.context;
  });

  const {menuPos, dialogPos} = useMemo(() => {
    const menuPos = {left: 0, top: 0};
    const dialogPos = {top: 0};
    if (selection) {
      const selectionPos = selection.pos;
      menuPos.left = selectionPos.x;
      menuPos.top = selectionPos.y - 100;

      const menuMaxTop = window.innerHeight - MenuHeight;
      if (menuPos.top > menuMaxTop) {
        menuPos.top = menuMaxTop;
      }
      const selectionBottom = window.innerHeight - selectionPos.y;
      dialogPos.top = selectionPos.y < selectionBottom ? selectionPos.y : -selectionBottom - 36;
    }
    return {menuPos, dialogPos};
  }, [selection]);

  const aiRef: IAIRef = useMemo(() => {
    return {openMenu, closeMenu, menuIsOpen, insertHtmlByAI, getTitle, getDocId, getContext};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aiDialog = useMemo(() => {
    if (showDialog === 'A') {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AICreate aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (showDialog === 'C') {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AIContinue aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (showDialog === 'O') {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AIOutline aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (officialTemplates.some((item) => item.key === showDialog)) {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AITemplate templateOptions={officialTemplates} template={showDialog!} aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (applicationTemplates.some((item) => item.key === showDialog)) {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AITemplate templateOptions={applicationTemplates} template={showDialog!} aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    return <AIMenu menuPos={menuPos} onSelect={setShowDialog} onCancel={closeMenu} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogPos.top, menuPos, showDialog]);

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
