import {QuestionCircleFilled} from '@ant-design/icons';
import {Boot, IDomEditor, IModalMenu, SlateEditor} from '@wangeditor-next/editor';
import {Button, Divider} from 'antd';
import {FC, ReactNode, memo, useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {eachTree, useEvent} from '@/utils/tools';
import AILayer from '../AILayer';
import AiIcon from '../ColorAIcon';
import {getSelectionContext} from '../utils';
import styles from './index.module.less';
import type {IAIRef, ISelection} from '../AILayer';
import './registerMenu';

function withAiModal<T extends IDomEditor>(editor: T): T {
  const {insertText} = editor; // 获取当前 editor API
  const newEditor = editor;

  newEditor.insertText = (t) => {
    if (t === '/') {
      setTimeout(() => {
        const menuButton = document.getElementById('_ai_button') as any;
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
  const onClick = useEvent(() => {
    const pos = editor.getSelectionPosition() || {top: '0', left: '0'};
    if ((pos.top === '0' && pos.left === '0') || aiRef?.menuIsOpen()) {
      return;
    }
    const posNum = {
      left: parseInt(pos.left || '0'),
      top: parseInt(pos.top || '0'),
      right: parseInt(pos.right || '0'),
      bottom: parseInt(pos.bottom || '0'),
    };
    //console.log(posNum);
    const editorContainer = editor.getEditableContainer() as HTMLElement;
    const containerRect = editorContainer.getBoundingClientRect();
    const selectionPos: ISelection['pos'] = {x: 0, y: 0};

    if (posNum.left) {
      selectionPos.x = posNum.left + containerRect.left;
    } else if (posNum.right) {
      selectionPos.x = containerRect.left - posNum.right + containerRect.width + 8;
    }
    if (posNum.top) {
      selectionPos.y = posNum.top + containerRect.top;
    } else if (posNum.bottom) {
      selectionPos.y = containerRect.height - posNum.bottom + containerRect.top + 35;
    }
    aiRef?.openMenu({pos: selectionPos, ...getSelectionContext(editor)});
  });

  const closeMenu = useEvent(() => aiRef?.closeMenu());

  useEffect(() => {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Button id="_ai_button" className={styles.button} type="text" icon={<AiIcon />} onClick={onClick}>
        AI创作
      </Button>
      <div className="w-e-bar-divider"></div>
      <AIPortal editor={editor} onCreated={setAiRef}></AIPortal>
    </>
  );
};

export default memo(Component);
