import {CloseOutlined, PauseCircleOutlined} from '@ant-design/icons';
import {DomEditor, IDomEditor, SlateEditor, SlateTransforms} from '@wangeditor-next/editor';
import {Button, Spin} from 'antd';
import {FC, memo, useEffect, useRef, useState} from 'react';
import {addClass, removeClass, useEvent} from '@/utils/tools';
import styles from './index.module.less';
interface Props {
  onCancel: () => void;
  loading?: boolean;
  editor: IDomEditor;
}

type ReviewItem = {id: string; source: string; target: string; reason: string; at: number[]};

const Component: FC<Props> = ({onCancel, loading, editor}) => {
  const [show, setShow] = useState(false);
  const [list, setList] = useState<ReviewItem[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<HTMLDivElement>(null);

  const onClose = useEvent(() => {
    if (loading) {
      const dialog = controllerRef.current as any;
      if (dialog) {
        addClass(dialog, 'anmi');
        setTimeout(() => removeClass(dialog, 'anmi'), 200);
      }
    } else {
      setShow(false);
    }
  });

  const onDocChange = useEvent(() => {
    if (!show) {
      return;
    }
    const items: ReviewItem[] = [];
    const elems: any[] = editor.getElemsByType('review') || [];
    const nodes = SlateEditor.nodes(editor, {
      at: [],
      match: (node: any, path) => node.type === 'review',
    });
    let i = 0;
    for (const entry of nodes) {
      const item: ReviewItem = {...elems[i], at: entry[1]};
      if (item.source) {
        items.push(item);
      }
      i++;
    }
    setList(items);
    if (loading) {
      setTimeout(() => {
        scrollerRef.current!.scrollTop = 999999999;
        const ul = scrollerRef.current!.children[0];
        const li = ul.children[ul.children.length - 1];
        if (li) {
          (li as any).click();
        }
      });
    }
  });

  useEffect(() => {
    onDocChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    editor.on('change', onDocChange);
    const div = document.getElementById('w-e-textarea-1')?.parentElement;
    if (div) {
      div.addEventListener('click', onClose);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <span id="_ai_inspectList_btn" className="btn inspect" onClick={() => setShow(true)} />
      <div className={styles.panel + (show ? ' on' : '')}>
        <div className="hd">
          <span>合同审查</span>
          <Button size="small" icon={<CloseOutlined />} type="text" onClick={onClose} />
        </div>
        <div className="cd">
          <strong>共{list.length}条</strong>
        </div>
        <div className="bd" ref={scrollerRef}>
          <ul></ul>
          {loading && (
            <div className="more">
              <Spin size="small" />
            </div>
          )}
        </div>
      </div>
      {loading && (
        <div className={styles.mask} onClick={onClose}>
          <div ref={controllerRef}>
            <div className="wrap">
              <Spin size="small" />
              <span>AI审查中...</span>
              <Button className="stop" title="停止" size="small" type="text" icon={<PauseCircleOutlined />} onClick={onCancel}></Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Component);
