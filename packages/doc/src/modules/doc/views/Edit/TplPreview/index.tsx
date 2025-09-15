import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {debounce} from '@/utils/tools';
import styles from './index.module.less';

interface Props {
  title: string;
  tpl: string;
}

const Component: FC<Props> = ({title, tpl}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('');

  useMemo(() => {
    setHtml(tpl);
  }, [tpl]);

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
      <div className="editor" dangerouslySetInnerHTML={{__html: html}} />
    </div>
  );
};

export default memo(Component);
