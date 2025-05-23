import {Boot, DomEditor, IDomEditor, IModalMenu, SlateEditor, SlateTransforms} from '@wangeditor-next/editor';
import {Button, Spin} from 'antd';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {addClass, debounce, message, removeClass, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import VarAsk from '../VarAsk';
import VarDate from '../VarDate';
import VarImage from '../VarImage';
import styles from './index.module.less';

export interface VarEvent {
  elem: VariableElement;
  pos: {x: number; y: number; width: number; height: number};
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
    }
    return null;
  }, [onSubmit, closeMenu, varEvent]);

  useEffect(() => {
    const handler = (data: {elem: VariableElement; pos: {x: number; y: number; width: number; height: number}}) => {
      setVarEvent(data);
    };
    const div = document.getElementById('w-e-textarea-1')?.parentElement;
    if (div) {
      div.addEventListener('click', (e: any) => {
        if (e.target.className === 'w-e-variable on' || e.target.parentNode.className === 'w-e-variable on') {
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

  if (!varEvent) {
    return null;
  }
  return (
    <>
      <div className={styles.dialog} style={{left: varEvent.pos.x, top: varEvent.pos.y + varEvent.pos.height + 5}}>
        {varDialog}
      </div>
    </>
  );
};

export default memo(Component);
