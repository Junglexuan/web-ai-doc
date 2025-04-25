import {QuestionCircleFilled} from '@ant-design/icons';
import {Boot, IDomEditor, IModalMenu, SlateEditor} from '@wangeditor-next/editor';
import {Button, Divider} from 'antd';
import {FC, ReactNode, memo, useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {addClass, useEvent} from '@/utils/tools';
import AILayer from '../AILayer';
import AiIcon from '../ColorAIcon';
import styles from './index.module.less';
import type {IAIRef} from '../AILayer';
import './registerMenu';

function withAiModal<T extends IDomEditor>(editor: T): T {
  const {insertText} = editor; // 获取当前 editor API
  const newEditor = editor;

  newEditor.insertText = (t) => {
    if (t === '/') {
      setTimeout(() => {
        const menuButton = document.getElementById('_ai_button') as HTMLElement;
        menuButton.setAttribute('data-trigger', '/');
        menuButton.click();
      });
    }
    insertText(t);
  };

  return newEditor;
}
Boot.registerPlugin(withAiModal);

interface LayerProps {
  editor: IDomEditor;
  onCreated: (ref: IAIRef) => void;
}

const AIPortal: FC<LayerProps> = ({onCreated, editor}) => {
  return createPortal(<AILayer editor={editor} onCreated={onCreated} />, document.body);
};

interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const [aiRef, setAiRef] = useState<IAIRef>();
  const onClick = useEvent(({target}: {target: HTMLElement}) => {
    const trigger = target.getAttribute('data-trigger');
    target.setAttribute('data-trigger', '');
    if (!editor.selection || aiRef?.menuIsOpen()) {
      return;
    }
    aiRef?.openMenu({editor, triggerWithChar: trigger === '/', selectionRange: window.getSelection()?.getRangeAt(0)});
    const scroller = document.getElementById('_ai_editor_scroller')!;
    addClass(scroller, 'on');
  });

  const closeMenu = useEvent(() => aiRef?.closeMenu());

  const onKeyDown = useEvent((e: any) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  useEffect(() => {
    document.addEventListener('keyup', onKeyDown);

    return () => document.removeEventListener('keyup', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Button id="_ai_button" className={styles.button} type="text" icon={<AiIcon />} onClick={onClick as any}>
        AI创作
      </Button>
      <div className="w-e-bar-divider"></div>
      <AIPortal editor={editor} onCreated={setAiRef}></AIPortal>
    </>
  );
};

export default memo(Component);
