import {DomEditor, IDomEditor, SlateTransforms} from '@wangeditor-next/editor';
import {FC, memo, useEffect, useMemo, useState} from 'react';
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
  const [varEvent, setVarEvent] = useState<VarEvent>();

  const closeMenu = useEvent(() => {
    setVarEvent(undefined);
    editor.focus();
  });

  const onSubmit = useEvent((elem: VariableElement, update: Partial<VariableElement>) => {
    closeMenu();
    const path = DomEditor.findPath(editor, elem);
    SlateTransforms.setNodes(editor, update, {at: path});
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
    }
    return null;
  }, [onSubmit, closeMenu, varEvent]);

  const posStyle = useMemo(() => {
    if (!varEvent) {
      return {};
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
    //console.log(varEvent.pos);
    return style;
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
      <div className={styles.dialog} style={posStyle}>
        <div className="wrap">{varDialog}</div>
      </div>
    </>
  );
};

export default memo(Component);
