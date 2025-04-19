import {FC, ReactNode, memo, useEffect, useRef} from 'react';
import styles from './index.module.less';
import type {AIEvent} from '../utils';

interface Props {
  event: AIEvent;
  children: ReactNode;
  //footer: ReactNode;
}

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const placeholder = document.getElementById('_ai_placeholder');
    if (placeholder) {
      placeholder.style.height = entry.contentRect.height + 5 + 'px';
    }
  }
});

const placeMaxHeight = 400;

const Component: FC<Props> = ({event, children}) => {
  const rootDivRef = useRef<HTMLElement>();

  useEffect(() => {
    const rootDiv = rootDivRef.current!;
    const placeholder = event.placeholder;
    if (placeholder) {
      const placeholderRect = placeholder.getBoundingClientRect();
      const selectionBottom = window.innerHeight - placeholderRect.y;
      //const dialogRect = rootDiv.getBoundingClientRect();
      //const dialogHeight = dialogRect.height;
      //placeholder.style.height = dialogHeight + 'px';
      if (selectionBottom < placeMaxHeight) {
        const editorContainer = document.getElementById('_ai_editor_scroller')!;
        editorContainer.scrollTo({top: editorContainer.scrollTop + placeMaxHeight - selectionBottom});
      }
      //scrollTo会有延迟变化
      setTimeout(() => {
        const rect = placeholder.getBoundingClientRect();
        rootDiv.style.top = rect.y + 5 + 'px';
        rootDiv.style.opacity = '1';
      }, 50);
    }
    resizeObserver.observe(rootDiv);
    return () => resizeObserver.unobserve(rootDiv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.dialog} ref={rootDivRef as any}>
      <div className="wrap">{children}</div>
    </div>
  );
};

export default memo(Component);
