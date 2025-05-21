import {Boot, DomEditor, IDomEditor, IModalMenu, SlateEditor, SlateTransforms} from '@wangeditor-next/editor';
import {Button, Spin} from 'antd';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {addClass, debounce, message, removeClass, useEvent} from '@/utils/tools';
import AIOutline from '../AIOutline';
import AIStylize from '../AIStylize';
import AIWeb from '../AIWeb';
import api, {RunningState} from '../api';
import {VariableElement} from '../elements/Variable/custom-types';
import {proofreadHtml} from '../utils';
import VarDate from '../VarDate';
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

  const closeMenu = useEvent((force?: boolean) => {
    setVarEvent(undefined);
    editor.focus();
    // const scroller = document.getElementById('_ai_editor_scroller')!;
    // removeClass(scroller, 'on');
    //
  });

  const onSubmit = useEvent((elem: VariableElement, update: Partial<VariableElement>) => {
    closeMenu();
    const path = DomEditor.findPath(editor, elem);
    console.log(path);
    SlateTransforms.setNodes(
      editor,
      {
        source: update.source,
      } as any,
      {at: path}
    );
    // SlateTransforms
  });

  const varDialog = useMemo(() => {
    if (!varEvent) {
      return null;
    }
    switch (varEvent.elem.kind) {
      case 'date':
        return <VarDate elem={varEvent.elem} onSubmit={onSubmit} />;
    }
    return null;
  }, [onSubmit, varEvent]);

  useEffect(() => {
    const handler = (data: {elem: VariableElement; pos: {x: number; y: number; width: number; height: number}}) => {
      setVarEvent(data);
    };
    editor.on('variable-selected', handler);
    return () => {
      editor.off('variable-selected', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!varEvent) {
    return null;
  }
  console.log(varEvent);
  return (
    <>
      <div className={styles.dialog} style={{left: varEvent.pos.x, top: varEvent.pos.y + varEvent.pos.height + 5}}>
        {varDialog}
      </div>
      <div className={styles.mask} onClick={() => closeMenu()}></div>
    </>
  );
};

export default memo(Component);
