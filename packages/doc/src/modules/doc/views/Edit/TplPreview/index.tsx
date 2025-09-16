import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {debounce, useEvent} from '@/utils/tools';
import {AiAPI} from '../api';
import styles from './index.module.less';

interface FieldItem {
  html: string;
  kind: string;
  field: string;
  source: string;
  dom?: Element;
  abort?: () => void;
}

function getTextNode(parent: Element): Element {
  const childNodes = parent.childNodes;
  for (let i = 0, k = childNodes.length; i < k; i++) {
    const child = childNodes[i];
    if (child.nodeType === 3) {
      return parent;
    } else if (child.nodeType === 1) {
      return getTextNode(child as Element);
    }
  }
  return parent;
}

interface Props {
  title: string;
  tpl: string;
}

const Component: FC<Props> = ({title, tpl}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('');
  const fieldsDataRef = useRef<{[field: string]: FieldItem}>({});

  const onMessage = useEvent((field: string, html: string) => {
    const dom = fieldsDataRef.current[field]?.dom;
    if (dom) {
      dom.innerHTML = html;
    }
  });

  useMemo(() => {
    const newFields: {[field: string]: FieldItem} = {};
    tpl.replace(/<cite data-w-e-type="variable".*? data-kind="(.*?)".*? data-field="(.*?)".*? data-source="(.*?)".+?<\/cite>/g, (a, b, c, d) => {
      if (b) {
        newFields[c] = {html: a, kind: b, field: c, source: d};
      }
      return a;
    });
    const oriFields = fieldsDataRef.current;
    Object.keys(oriFields).forEach((field) => {
      if (oriFields[field].html !== newFields[field]?.html) {
        oriFields[field].abort!();
        delete oriFields[field];
      }
    });
    setHtml(tpl);
    setTimeout(() => {
      const doms: {[field: string]: Element} = {};
      const cites = rootRef.current!.querySelectorAll('cite[data-w-e-type="variable"]');
      cites.forEach((cite) => {
        doms[cite.getAttribute('data-field') || ''] = getTextNode(cite)!;
      });
      Object.keys(doms).forEach((field) => {
        const oDom = oriFields[field]?.dom;
        const nDom = doms[field];
        if (nDom && oDom) {
          nDom.innerHTML = oDom.innerHTML;
        }
      });
      Object.keys(newFields).forEach((field) => {
        newFields[field].dom = doms[field];
        if (oriFields[field]) {
          newFields[field].abort = oriFields[field].abort;
        } else {
          newFields[field].abort = AiAPI.featchTplTag(field, newFields[field], onMessage).abort;
        }
      });
      fieldsDataRef.current = newFields;
    });
  }, [onMessage, tpl]);

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
