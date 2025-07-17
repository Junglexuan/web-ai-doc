import {CloseOutlined, PicRightOutlined} from '@ant-design/icons';
import {DomEditor, IDomEditor, SlateEditor, SlateTransforms} from '@wangeditor-next/editor';
// eslint-disable-next-line import/order
import type {NodeEntry} from 'slate';
import {Button} from 'antd';
import {FC, memo, useEffect, useState} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';
interface Props {
  editor: IDomEditor;
}

type ReviewItem = {id: string; source: string; target: string; reason: string; at: number[]};

const Component: FC<Props> = ({editor}) => {
  const [show, setShow] = useState(false);
  const [list, setList] = useState<ReviewItem[]>([]);

  const onClick = useEvent((e: any) => {
    if (e.target.tagName !== 'LI') return;
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const dom = document.getElementById(id);
    if (dom) {
      dom.scrollIntoView();
    }
    //editor.scrollToElem(id);
  });

  const ignoreAll = useEvent(() => {
    editor.deselect();
    SlateTransforms.setNodes(editor, {source: '', target: '', reason: ''} as any, {
      at: [],
      match: (node) => DomEditor.checkNodeType(node, 'review'),
    });
  });

  const ignoreItem = useEvent((item: ReviewItem) => {
    console.log(item);
    // SlateTransforms.wrapNodes(
    //   editor,
    //   {},
    //   {
    //     at: item.at,
    //   }
    // );
    SlateTransforms.setNodes(editor, {source: '', target: '', reason: ''} as any, {
      at: item.at,
    });
  });

  // const replaceAll = useEvent(() => {
  //   list.forEach((item) => {
  //     SlateTransforms.unwrapNodes(editor, {
  //       match: (n) => DomEditor.checkNodeType(n, 'review'),
  //     });
  //     editor;
  //   });
  // });

  const replaceItem = useEvent((item: ReviewItem) => {
    setTimeout(() => {
      console.log(item.at);
      const textNode = DomEditor.getSelectedTextNode(editor);
      if (textNode) {
        const path = DomEditor.findPath(editor, textNode);
        SlateTransforms.select(editor, path);
        SlateTransforms.insertText(editor, item.target || '');
        editor.deselect();
        SlateTransforms.unwrapNodes(editor, {
          at: item.at,
        });
      }
    }, 300);

    // SlateTransforms.unwrapNodes(editor, {
    //   at: item.at,
    // });
  });

  const onSelect = useEvent((item: ReviewItem) => {
    SlateTransforms.select(editor, {path: [...item.at, 0], offset: 1});
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
  });

  useEffect(() => {
    onDocChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    editor.on('change', onDocChange);
    const div = document.getElementById('w-e-textarea-1')?.parentElement;
    if (div) {
      div.addEventListener('click', () => {
        setShow(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <span id="_ai_review_btn" className="btn check" onClick={() => setShow(!show)} />
      {/* <div className={styles.mask + (show ? ' on' : '')} onClick={() => setShow(!show)}></div> */}
      <div className={styles.panel + (show ? ' on' : '')}>
        <div className="hd">
          <span>校阅</span>
          <Button size="small" icon={<CloseOutlined />} type="text" onClick={() => setShow(!show)} />
        </div>
        <div className="cd">
          <strong>共{list.length}条</strong>
          <div>
            <Button size="small" onClick={ignoreAll}>
              全部忽略
            </Button>
          </div>
        </div>
        <div className="bd">
          <ul onClick={onClick}>
            {list.map((item) => {
              return (
                <li key={item.id} data-id={item.id} onClick={() => onSelect(item)}>
                  <div className="hd">
                    <span>文字差错</span>
                    <div>
                      <Button type="text" size="small" style={{color: 'inherit'}} onClick={() => replaceItem(item)}>
                        替换
                      </Button>
                      <Button type="text" size="small" style={{color: 'inherit'}} onClick={() => ignoreItem(item)}>
                        忽略
                      </Button>
                    </div>
                  </div>
                  <div className="bd">
                    <span className="source">{item.source}</span>
                    <span className="arrow">→</span>
                    <span className="target">{item.target}</span>
                  </div>
                  <div className="ft">{item.reason}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default memo(Component);
