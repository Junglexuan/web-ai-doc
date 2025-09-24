import {DomEditor, IDomEditor, SlateTransforms} from '@wangeditor-next/editor';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {closestTarget, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import VarAsk from '../VarAsk';
import VarDate from '../VarDate';
import VarImage from '../VarImage';
import VarReplace from '../VarReplace';
import VarWrite from '../VarWrite';
import styles from './index.module.less';

export interface VarEvent {
  elem: VariableElement;
  pos: DOMRect;
}

interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [varEvent, setVarEvent] = useState<VarEvent>();
  const [posStyle, setPosStyle] = useState<{left?: number; top?: number; bottom?: number}>({});

  const closeMenu = useEvent(() => {
    setVarEvent(undefined);
    editor.focus();
  });

  const selectText = useEvent(() => {
    const textNode = DomEditor.getSelectedTextNode(editor);
    if (textNode) {
      const path = DomEditor.findPath(editor, textNode);
      SlateTransforms.select(editor, path);
    }
  });
  const onSubmit = useEvent((elem: VariableElement, update: Partial<VariableElement>) => {
    closeMenu();
    const path = DomEditor.findPath(editor, elem);
    SlateTransforms.setNodes(editor, update, {at: path});
    if (elem.kind !== 'write') {
      selectText();
    }
  });

  const varDialog = useMemo(() => {
    if (!varEvent) {
      return null;
    }
    switch (varEvent.elem.kind) {
      case 'date':
        return <VarDate elem={varEvent.elem} onSubmit={onSubmit} onCancel={closeMenu} />;
      case 'image':
        return <VarImage elem={varEvent.elem} onSubmit={onSubmit} onCancel={closeMenu} />;
      case 'ask':
        return <VarAsk elem={varEvent.elem} onSubmit={onSubmit} onCancel={closeMenu} />;
      case 'write':
        return <VarWrite elem={varEvent.elem} onSubmit={onSubmit} onCancel={closeMenu} />;
      case 'replace':
        return <VarReplace elem={varEvent.elem} onSubmit={onSubmit} onCancel={closeMenu} />;
      case 'sign':
        selectText();
        return null;
    }
    return null;
  }, [onSubmit, closeMenu, selectText, varEvent]);

  useMemo(() => {
    if (!varEvent) {
      return setPosStyle({});
    }
    const selectionRect = varEvent.pos;
    const style: {left: number; top?: number; bottom?: number} = {left: selectionRect.left};
    const dTop = selectionRect.top;
    const dBottom = window.innerHeight - selectionRect.bottom;
    if (dTop > dBottom) {
      style.bottom = window.innerHeight - selectionRect.top + 5;
    } else {
      style.top = selectionRect.bottom + 5;
    }
    setPosStyle(style);
  }, [varEvent]);

  useEffect(() => {
    if (dialogRef.current) {
      const dialogHeight = dialogRef.current!.offsetHeight;
      const limit = window.innerHeight - dialogHeight;
      if (posStyle.bottom) {
        if (posStyle.bottom > limit) {
          setPosStyle({...posStyle, bottom: limit});
        }
      } else if (posStyle.top) {
        if (posStyle.top > limit) {
          setPosStyle({...posStyle, top: limit});
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varEvent]);

  useEffect(() => {
    const handler = (data: {elem: VariableElement; pos: DOMRect}) => {
      setVarEvent(data);
    };
    const div = document.getElementById('w-e-textarea-1')?.parentElement;
    if (div) {
      div.addEventListener('click', (e: any) => {
        if (e.target.className.startsWith('w-e-variable')) {
          return;
        }
        const target = closestTarget(
          e.target,
          (dom) => {
            return dom.className.startsWith('w-e-variable');
          },
          div
        );
        if (target) {
          return;
        }
        closeMenu();
      });
    }
    editor.on('variable-selected', handler);
    return () => {
      editor.off('variable-selected', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!varEvent || !varDialog) {
    return null;
  }
  return (
    <>
      <div className={styles.dialog} style={posStyle} ref={dialogRef}>
        <div className="wrap">{varDialog}</div>
      </div>
    </>
  );
};

export default memo(Component);
