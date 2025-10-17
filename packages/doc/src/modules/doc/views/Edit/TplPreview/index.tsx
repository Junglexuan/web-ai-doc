import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {debounce, useEvent} from '@/utils/tools';
import {DocAPI} from '../../../api';
import {AiAPI} from '../api';
import {filterHtmlTag} from '../utils';
import styles from './index.module.less';

interface FieldItem {
  html: string;
  kind: string;
  field: string;
  source: string;
  doms: Element[];
  abort?: () => void;
}

function getTextNode(parent: Element): Element {
  if (parent.getAttribute('data-kind') === 'write') {
    return parent;
  }
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
  id: string;
  title: string;
  tpl: string;
  snapshot: string;
  layout: number;
  setLayout: (n: number) => void;
}

const Component: FC<Props> = ({id, title, tpl, snapshot, layout, setLayout}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const articeRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('');
  const fieldsDataRef = useRef<{[field: string]: FieldItem}>(null as any);

  const onSave = useMemo(
    () =>
      debounce(() => {
        const html = articeRef.current!.innerHTML;
        DocAPI.saveSnapshot(id, html);
      }, 2000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onMessage = useEvent((field: string, html: string) => {
    const doms = fieldsDataRef.current[field]?.doms;
    if (doms) {
      doms.forEach((dom) => {
        dom.innerHTML = html;
      });
    }
  });

  const featchTplTag = useEvent((field: string, args: {html: string; kind: string; source: string}) => {
    const arr = tpl.split(args.html);
    const html = arr[0] || '';
    const context = filterHtmlTag(html);
    return AiAPI.featchTplTag(field, args, title, context.slice(-200), onMessage);
  });

  useMemo(() => {
    if (!fieldsDataRef.current) {
      return;
    }
    const newFields: {[field: string]: FieldItem} = {};
    const preview = tpl.replace(
      /<cite data-w-e-type="variable".*? data-kind="(.*?)".*? data-field="(.*?)".*? data-source="(.*?)".+?<\/cite>/g,
      (a, b, c, d) => {
        if (b && c) {
          newFields[c] = {html: a, kind: b, field: c, source: d, doms: []};
        }
        if (b === 'write') {
          return '<div' + a.slice(5, -5) + 'div>';
        } else {
          return a;
        }
      }
    );
    const oriFields = fieldsDataRef.current;
    Object.keys(oriFields).forEach((field) => {
      if (oriFields[field].source !== newFields[field]?.source) {
        oriFields[field].abort!();
        delete oriFields[field];
      }
    });
    setHtml(preview);
    onSave();
    setTimeout(() => {
      const doms: {[field: string]: Element[]} = {};
      const cites = rootRef.current!.querySelectorAll('[data-w-e-type="variable"]');
      cites.forEach((cite) => {
        const filed = cite.getAttribute('data-field');
        if (filed) {
          if (!doms[filed]) {
            doms[filed] = [];
          }
          doms[filed].push(getTextNode(cite));
        }
      });
      Object.keys(doms).forEach((field) => {
        const oDoms = oriFields[field]?.doms || [];
        const oHtml = oDoms[0]?.innerHTML;
        const nDoms = doms[field];
        if (nDoms && oHtml) {
          nDoms.forEach((dom) => {
            dom.innerHTML = oHtml;
          });
        }
      });
      Object.keys(newFields).forEach((field) => {
        newFields[field].doms = doms[field];
        if (oriFields[field]) {
          newFields[field].abort = oriFields[field].abort;
        } else {
          newFields[field].abort = featchTplTag(field, newFields[field]).abort;
        }
      });
      fieldsDataRef.current = newFields;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpl]);

  useEffect(() => {
    const oriFields: {[field: string]: FieldItem} = {};
    snapshot.replace(/<cite data-w-e-type="variable".*? data-kind="(.*?)".*? data-field="(.*?)".*? data-source="(.*?)".+?<\/cite>/g, (a, b, c, d) => {
      if (b && c) {
        oriFields[c] = {html: a, kind: b, field: c, source: d, doms: []};
      }
      return a;
    });
    snapshot.replace(/<div data-w-e-type="variable".*? data-kind="(.*?)".*? data-field="(.*?)".*? data-source="(.*?)".+?<\/div>/g, (a, b, c, d) => {
      if (b && c) {
        oriFields[c] = {html: a, kind: b, field: c, source: d, doms: []};
      }
      return a;
    });
    setHtml(snapshot);
    setTimeout(() => {
      const doms: {[field: string]: Element[]} = {};
      const cites = rootRef.current!.querySelectorAll('[data-w-e-type="variable"]');
      cites.forEach((cite) => {
        const filed = cite.getAttribute('data-field');
        if (filed) {
          if (!doms[filed]) {
            doms[filed] = [];
          }
          doms[filed].push(getTextNode(cite));
        }
      });
      Object.keys(oriFields).forEach((field) => {
        oriFields[field].doms = doms[field];
        oriFields[field].abort = () => undefined;
      });
      fieldsDataRef.current = oriFields;
      console.log(oriFields);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className={styles.root + ` n${layout}`} ref={rootRef}>
      <header>
        <div className={'close' + ` n${layout}`} onClick={() => setLayout(layout === 1 ? 0 : 1)} />
        <div className={'expand' + ` n${layout}`} onClick={() => setLayout(layout === 2 ? 0 : 2)} />
        <div className="subject">效果预览</div>
        <div className="title">{title}</div>
      </header>
      <div className="w-editor-preview" dangerouslySetInnerHTML={{__html: html}} ref={articeRef} />
    </div>
  );
};

export default memo(Component);
