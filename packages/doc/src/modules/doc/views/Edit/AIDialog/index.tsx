import {FC, ReactNode, memo, useEffect, useRef} from 'react';
import styles from './index.module.less';
import type {AIEvent} from '../utils';

interface Props {
  event: AIEvent;
  children: ReactNode;
  //footer: ReactNode;
}

const placeMaxHeight = 400;

const Component: FC<Props> = ({event, children}) => {
  const rootDivRef = useRef<HTMLElement>();

  useEffect(() => {
    if (event.placeholder) {
      const placeholderRect = event.placeholder.getBoundingClientRect();
      const selectionBottom = window.innerHeight - placeholderRect.y;
      const dialogRect = rootDivRef.current!.getBoundingClientRect();
      const dialogHeight = dialogRect.height;
      event.placeholder.style.height = dialogHeight + 'px';
      if (selectionBottom < placeMaxHeight) {
        const editorContainer = document.getElementById('_ai_editor_scroller')!;
        editorContainer.scrollTo({top: editorContainer.scrollTop + placeMaxHeight - selectionBottom});
      }
      setTimeout(() => {
        const rect = event.placeholder!.getBoundingClientRect();
        rootDivRef.current!.style.top = rect.y + 5 + 'px';
        rootDivRef.current!.style.opacity = '1';
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.dialog} ref={rootDivRef as any}>
      <div className="wrap">{children}</div>
    </div>
  );
};

export default memo(Component);
