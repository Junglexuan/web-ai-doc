import {FC, memo, useEffect, useRef} from 'react';
import {debounce} from '@/utils/tools';
import styles from './index.module.less';

interface Props {
  title: string;
  html: string;
}

const Component: FC<Props> = ({title, html}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editorDom = document.getElementById('_ai_editor_scroller')!;
    const rect = editorDom.getBoundingClientRect();
    rootRef.current!.style.top = rect.top + 'px';
    rootRef.current!.style.height = rect.height + 'px';

    const onResize = debounce(() => {
      const rect = editorDom.getBoundingClientRect();
      rootRef.current!.style.top = rect.top + 'px';
      rootRef.current!.style.height = rect.height + 'px';
    }, 300);

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return (
    <div className={styles.root} ref={rootRef}>
      <header>
        <div className="subject">效果预览</div>
        <div className="title">{title}</div>
      </header>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </div>
  );
};

export default memo(Component);
