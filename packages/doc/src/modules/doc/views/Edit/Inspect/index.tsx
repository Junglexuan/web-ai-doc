import {CaretRightOutlined, CloseOutlined, PauseCircleOutlined} from '@ant-design/icons';
import {DomEditor, IDomEditor, SlateEditor, SlateTransforms} from '@wangeditor-next/editor';
import {Button, Collapse, Spin} from 'antd';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {addClass, removeClass, useEvent} from '@/utils/tools';
import styles from './index.module.less';
interface Props {
  onCancel: () => void;
  loading?: boolean;
  editor: IDomEditor;
}

type ReviewItem = {id: string; source: string; target: string; reason: string; level: Level; at: number[]};

type Level = 'high' | 'mid' | 'low';

const LevelLabels = {
  high: '高风险',
  mid: '中风险',
  low: '低风险',
};

const Component: FC<Props> = ({onCancel, loading, editor}) => {
  const [show, setShow] = useState(false);
  const [list, setList] = useState<ReviewItem[]>([]);
  const [curLevel, setCurLevel] = useState<Level>();
  const [itemNum, setItemNum] = useState(0);
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

  const onSelect = useEvent((item: ReviewItem) => {
    SlateTransforms.select(editor, {path: [...item.at, 0], offset: 1});
    const dom = document.getElementById(item.id);
    if (dom) {
      dom.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  });

  const replaceItem = useEvent((item: ReviewItem) => {
    onSelect(item);
    setTimeout(() => {
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

  const ignoreItem = useEvent((item: ReviewItem) => {
    SlateTransforms.unwrapNodes(editor, {
      at: item.at,
    });
  });

  const onDocChange = useEvent(() => {
    const elems: any[] = editor.getElemsByType('inspect') || [];
    setItemNum(elems.length);
    if (!show) {
      return;
    }
    const items: ReviewItem[] = [];
    const nodes = SlateEditor.nodes(editor, {
      at: [],
      match: (node: any, path) => node.type === 'inspect',
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
          const span = li.getElementsByClassName('inspect-item');
          if (span && span[0]) {
            (span[0] as any).click();
          }
        }
      });
    }
  });

  const collapseItems = useMemo(() => {
    return list
      .filter((item) => {
        return !curLevel ? true : item.level === curLevel;
      })
      .map((item) => {
        return {
          key: item.id,
          label: (
            <>
              <span className={'tag ' + item.level}>{LevelLabels[item.level]}</span>
              <span className="title inspect-item" onClick={() => onSelect(item)}>
                {item.reason}
              </span>
            </>
          ),
          children: (
            <div>
              <dl>
                <dt>风险说明：</dt>
                <dd>{item.reason}</dd>
                <dt>原文引用：</dt>
                <dd onClick={() => onSelect(item)} className="source">
                  {item.source}
                </dd>
                <dt>建议改为：</dt>
                <dd>{item.target}</dd>
                <dt>
                  <Button size="small" variant="outlined" color="primary" onClick={() => replaceItem(item)}>
                    修改
                  </Button>
                </dt>
              </dl>
            </div>
          ),
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, curLevel]);

  useEffect(() => {
    onDocChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    const onItemScelect = (data: {elem: any}) => {
      console.log(data);
      const btn = document.getElementById('_ai_inspectList_btn');
      if (btn) {
        setTimeout(() => btn.click());
      }
    };
    editor.on('change', onDocChange);
    editor.on('inspect-selected', onItemScelect);

    return () => {
      editor.off('change', onDocChange);
      editor.off('inspect-selected', onItemScelect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <span
        style={{display: show || !itemNum ? 'none' : 'block'}}
        id="_ai_inspectList_btn"
        className="btn inspect show"
        onClick={() => {
          const reviewBtn = document.getElementById('_ai_reviewList_btnClose');
          const chartBtn = document.getElementById('_ai_chart_btnClose');
          reviewBtn?.click();
          chartBtn?.click();
          setShow(true);
        }}
      >
        审查内容
      </span>
      <span className="btn inspect close" id="_ai_inspectList_btnClose" style={{display: 'none'}} onClick={() => setShow(false)}>
        审查内容
      </span>
      <div className={styles.panel + (show ? ' on' : '')}>
        <div className="hd">
          <span>合同审查</span>
          <Button size="small" icon={<CloseOutlined />} type="text" onClick={onClose} />
        </div>
        <div className="cd">
          <div className={'h0' + (!curLevel ? ' on' : '')} onClick={() => setCurLevel(undefined)}>
            全部（{list.length}）
          </div>
          <div className={'h1' + (curLevel === 'high' ? ' on' : '')} onClick={() => setCurLevel('high')}>
            {`${LevelLabels.high}（${list.filter((item) => item.level === 'high').length}）`}
          </div>
          <div className={'h2' + (curLevel === 'mid' ? ' on' : '')} onClick={() => setCurLevel('mid')}>
            {`${LevelLabels.mid}（${list.filter((item) => item.level === 'mid').length}）`}
          </div>
          <div className={'h3' + (curLevel === 'low' ? ' on' : '')} onClick={() => setCurLevel('low')}>
            {`${LevelLabels.low}（${list.filter((item) => item.level === 'low').length}）`}
          </div>
        </div>
        <div className="bd" ref={scrollerRef}>
          <Collapse
            ghost
            size="small"
            collapsible="icon"
            expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            // style={{background: token.colorBgContainer}}
            items={collapseItems}
          />
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
