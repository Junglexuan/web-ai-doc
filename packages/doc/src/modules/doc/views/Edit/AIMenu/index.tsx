import {
  DatabaseOutlined,
  EditOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  LinkOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  PictureOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import {IDomEditor, SlateEditor, SlateTransforms} from '@wangeditor-next/editor';
import {Menu} from 'antd';
import {FC, memo, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {eachTree, insertAfter, removeClass, useEvent} from '@/utils/tools';
import AiIcon from '../AIcon';
import {AIEvent} from '../utils';
import styles from './index.module.less';

export interface MenuEvent {
  editor: IDomEditor;
  triggerWithChar: boolean;
  selectionRange?: Range;
}

type MenuItem = any;

export const officialTemplates: MenuItem[] = [
  {
    key: 'GYJ',
    title: '意见',
    label: (
      <span>
        <sub>(YJ)</sub>意见
      </span>
    ),
  },
  {
    key: 'GJD',
    title: '决定',
    label: (
      <span>
        <sub>(JD)</sub>决定
      </span>
    ),
  },
  {
    key: 'GJY',
    title: '决议',
    label: (
      <span>
        <sub>(JY)</sub>决议
      </span>
    ),
  },
  {
    key: 'GH',
    title: '函',
    label: (
      <span>
        <sub>(H)</sub>函
      </span>
    ),
  },
  {
    key: 'GPF',
    title: '批复',
    label: (
      <span>
        <sub>(PF)</sub>批复
      </span>
    ),
  },
  {
    key: 'GQS',
    title: '请示',
    label: (
      <span>
        <sub>(QS)</sub>请示
      </span>
    ),
  },
  {
    key: 'GBG',
    title: '报告',
    label: (
      <span>
        <sub>(BG)</sub>报告
      </span>
    ),
  },
  {
    key: 'GTB',
    title: '通报',
    label: (
      <span>
        <sub>(TB)</sub>通报
      </span>
    ),
  },
  {
    key: 'GTZ',
    title: '通知',
    label: (
      <span>
        <sub>(TZ)</sub>通知
      </span>
    ),
  },
  {
    key: 'GTG',
    title: '通告',
    label: (
      <span>
        <sub>(TG)</sub>通告
      </span>
    ),
  },
  {
    key: 'GGG',
    title: '公告',
    label: (
      <span>
        <sub>(GG)</sub>公告
      </span>
    ),
  },
  {
    key: 'GJY2',
    title: '纪要',
    label: (
      <span>
        <sub>(JY2)</sub>纪要
      </span>
    ),
  },
  {
    key: 'GGB',
    title: '公报',
    label: (
      <span>
        <sub>(GB)</sub>公报
      </span>
    ),
  },
  {
    key: 'GYA',
    title: '议案',
    label: (
      <span>
        <sub>(YA)</sub>议案
      </span>
    ),
  },
  {
    key: 'GML',
    title: '命令',
    label: (
      <span>
        <sub>(ML)</sub>命令
      </span>
    ),
  },
];

export const applicationTemplates: MenuItem[] = [
  {
    key: 'YSM',
    title: '声明',
    label: (
      <span>
        <sub>(SM)</sub>声明
      </span>
    ),
  },
  {
    key: 'YZJ',
    title: '总结',
    label: (
      <span>
        <sub>(ZJ)</sub>总结
      </span>
    ),
  },
  {
    key: 'YJH',
    title: '计划',
    label: (
      <span>
        <sub>(JH)</sub>计划
      </span>
    ),
  },
  {
    key: 'YGH',
    title: '规划',
    label: (
      <span>
        <sub>(GH)</sub>规划
      </span>
    ),
  },
  {
    key: 'YAP',
    title: '安排',
    label: (
      <span>
        <sub>(AP)</sub>安排
      </span>
    ),
  },
  {
    key: 'YGS',
    title: '公示',
    label: (
      <span>
        <sub>(GS)</sub>公示
      </span>
    ),
  },
  {
    key: 'YQS',
    title: '启事',
    label: (
      <span>
        <sub>(QS)</sub>启事
      </span>
    ),
  },
  {
    key: 'YXZ',
    title: '细则',
    label: (
      <span>
        <sub>(XZ)</sub>细则
      </span>
    ),
  },
  {
    key: 'YSZ',
    title: '守则',
    label: (
      <span>
        <sub>(SZ)</sub>守则
      </span>
    ),
  },
  {
    key: 'YZC',
    title: '章程',
    label: (
      <span>
        <sub>(ZC)</sub>章程
      </span>
    ),
  },
  {
    key: 'YBF',
    title: '办法',
    label: (
      <span>
        <sub>(BF)</sub>办法
      </span>
    ),
  },
  {
    key: 'YGD',
    title: '规定',
    label: (
      <span>
        <sub>(GD)</sub>规定
      </span>
    ),
  },
  {
    key: 'YTL',
    title: '条例',
    label: (
      <span>
        <sub>(TL)</sub>条例
      </span>
    ),
  },
];

export const stylesTemplates: MenuItem[] = [
  {
    key: 'RA',
    title: '更专业',
    label: (
      <span>
        <sub>(A)</sub>更专业
      </span>
    ),
  },
  {
    key: 'RB',
    title: '更轻松',
    label: (
      <span>
        <sub>(B)</sub>更轻松
      </span>
    ),
  },
  {
    key: 'RC',
    title: '更直白',
    label: (
      <span>
        <sub>(C)</sub>更直白
      </span>
    ),
  },
  {
    key: 'RD',
    title: '更自信',
    label: (
      <span>
        <sub>(D)</sub>更自信
      </span>
    ),
  },
  {
    key: 'RE',
    title: '更友好',
    label: (
      <span>
        <sub>(E)</sub>更友好
      </span>
    ),
  },
];

const originItems: MenuItem[] = [
  {
    key: '0',
    label: '辅助创作:',
    type: 'group',
  },
  {
    key: 'A',
    icon: <EditOutlined />,
    title: '生成全文',
    label: (
      <span>
        <sub>(A)</sub>生成全文
      </span>
    ),
  },
  {
    key: 'O',
    icon: <MenuUnfoldOutlined />,
    title: '生成大纲',
    label: (
      <span>
        <sub>(O)</sub>生成大纲
      </span>
    ),
  },
  {
    key: 'C',
    icon: <EditOutlined />,
    title: '继续写',
    label: (
      <span>
        <sub>(C)</sub>继续写
      </span>
    ),
  },
  // {
  //   key: 'G',
  //   icon: <WalletOutlined />,
  //   title: '法定公文',
  //   label: (
  //     <span>
  //       <sub>(G)</sub>法定公文
  //     </span>
  //   ),
  //   children: officialTemplates,
  // },
  // {
  //   key: 'Y',
  //   icon: <TagOutlined />,
  //   title: '规范应用',
  //   label: (
  //     <span>
  //       <sub>(Y)</sub>规范应用
  //     </span>
  //   ),
  //   children: applicationTemplates,
  // },
  {
    key: 'R',
    icon: (
      <span>
        <AiIcon />
      </span>
    ),
    title: '帮我润色',
    label: (
      <span>
        <sub>(R)</sub>帮我润色
      </span>
    ),
    children: stylesTemplates,
  },
  {
    key: 'J',
    icon: <FileTextOutlined />,
    title: '精简内容',
    label: (
      <span>
        <sub>(J)</sub>精简内容
      </span>
    ),
  },
  {
    key: 'F',
    icon: <FontSizeOutlined />,
    title: '丰富内容',
    label: (
      <span>
        <sub>(F)</sub>丰富内容
      </span>
    ),
  },
  {
    key: 'Z',
    icon: <DatabaseOutlined />,
    title: '生成摘要',
    label: (
      <span>
        <sub>(Z)</sub>生成摘要
      </span>
    ),
  },
  {
    key: 'X',
    icon: <ReadOutlined />,
    title: '校阅',
    label: (
      <span>
        <sub>(X)</sub>校阅
      </span>
    ),
  },
  {
    key: 'P',
    icon: <PictureOutlined />,
    title: '生成图片',
    label: (
      <span>
        <sub>(P)</sub>生成图片
      </span>
    ),
  },
  {
    key: 'divider',
    type: 'divider',
  },
  {
    key: 'T',
    icon: <MessageOutlined />,
    title: '提问',
    label: (
      <span>
        <sub>(T)</sub>提问
      </span>
    ),
  },
  {
    key: 'W',
    icon: <LinkOutlined />,
    title: '总结网页',
    label: (
      <span>
        <sub>(W)</sub>总结网页
      </span>
    ),
  },
];

const itemsMap = (function () {
  const map: {[shortcut: string]: MenuItem} = {};
  originItems
    .concat(officialTemplates)
    .concat(applicationTemplates)
    .concat(stylesTemplates)
    .forEach((item) => {
      const key = item!.key as string;
      map[key] = item;
    });
  return map;
})();

export const menuKeysMap = (function () {
  const map: {styles: {[key: string]: string}; official: {[key: string]: string}; application: {[key: string]: string}} = {
    styles: {},
    official: {},
    application: {},
  };
  stylesTemplates.forEach((item) => {
    const key = item!.key as string;
    map.styles[key] = item.title;
  });
  officialTemplates.forEach((item) => {
    const key = item!.key as string;
    map.official[key] = item.title;
  });
  applicationTemplates.forEach((item) => {
    const key = item!.key as string;
    map.application[key] = item.title;
  });
  return map;
})();

// function searchShortcut(key: string) {
//   const result: {selected?: string[]; openned?: string[]} = {selected: undefined, openned: undefined};
//   const key1 = key.charAt(1).toUpperCase();
//   const key2 = key.substring(2, key.length).toUpperCase();
//   const item1 = itemsMap[key1];
//   if (item1?.title) {
//     if (item1.disabled) {
//       return result;
//     }
//     result.selected = [item1.key];
//     if (item1?.children) {
//       result.openned = [item1.key];
//       if (key2) {
//         const item2 = itemsMap[key1 + key2];
//         if (item2?.title) {
//           result.selected.push(key1 + key2);
//         }
//       }
//     }
//   }
//   return result;
// }

function searchShortcut(key: string) {
  const result: {selected?: string[]; openned?: string[]} = {selected: undefined, openned: undefined};
  const key1 = key.charAt(1).toUpperCase();
  const item1 = itemsMap[key1];
  if (item1?.title && !item1.disabled) {
    if (item1?.children) {
      result.openned = [item1.key];
    }
    const key2 = key.substring(2).toUpperCase();
    if (key2) {
      if (item1?.children) {
        const item2 = itemsMap[key1 + key2];
        if (item2?.title) {
          result.selected = [item1.key, key1 + key2];
        }
      }
    } else {
      result.selected = [item1.key];
    }
  }
  return result;
}

interface Props {
  event: MenuEvent;
  onSelect: (event: AIEvent) => void;
  onCancel: () => void;
}

const Component: FC<Props> = (props) => {
  const {event, onCancel} = props;
  const rootDivRef = useRef<HTMLElement>();
  const menuInput = useRef<HTMLInputElement>(null as any);
  const compositionRef = useRef(false);
  const [menuStyles, setMenuStyles] = useState({left: 0, top: 0, pos: 'lt'});
  const [openKeys, setOpenKeys] = useState<string[]>();
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>();
  const [items] = useState(() => {
    if (!event.editor.getSelectionText()) {
      itemsMap['R'].disabled = true;
      itemsMap['J'].disabled = true;
      itemsMap['F'].disabled = true;
      itemsMap['Z'].disabled = true;
    } else {
      itemsMap['R'].disabled = undefined;
      itemsMap['J'].disabled = undefined;
      itemsMap['F'].disabled = undefined;
      itemsMap['Z'].disabled = undefined;
    }
    return originItems;
  });

  const onSelect = useEvent((key: string) => {
    const editor = event.editor;
    if (key === 'X') {
      props.onSelect({key} as any);
      return;
    }
    editor.focus();
    const selection = editor.selection;
    if (selection) {
      let result: AIEvent;
      let lastDom: HTMLElement;
      if (JSON.stringify(selection.anchor) === JSON.stringify(selection.focus)) {
        if (event.triggerWithChar) {
          editor.deleteBackward('character');
        }
        const [curNode] = SlateEditor.node(editor, selection);
        if ((curNode as any).text !== '') {
          editor.insertBreak();
        }
        SlateTransforms.setNodes(editor, {indent: ''} as any);
        lastDom = editor.toDOMNode(curNode);
        const dsl: any[] = editor.children;
        const text: string[] = [];
        eachTree(dsl, (node) => {
          if (node.text) {
            text.push(node.text);
          }
          return node === curNode;
        });
        //SlateEditor.above(editor, {at: editor.selection, match: (n) => SlateEditor.isBlock(editor, n) || SlateEditor.isEditor(n)});
        result = {key, context: text.join(''), content: ''} as any;
      } else {
        // const nodeEntries = SlateEditor.nodes(editor, {mode: 'lowest'});
        // if (nodeEntries) {
        //   for (const nodeEntry of nodeEntries) {
        //     const [node, path] = nodeEntry;
        //     console.log('选中了 paragraph 节点', node);
        //     console.log('节点 path 是', path);
        //   }
        // }
        const [anchor] = SlateEditor.node(editor, selection.anchor);
        const [focus] = SlateEditor.node(editor, selection.focus);
        const anchorDom = editor.toDOMNode(anchor);
        const focusDom = editor.toDOMNode(focus);
        const anchorRect = anchorDom.getBoundingClientRect();
        const focusRect = focusDom.getBoundingClientRect();
        result = {
          key,
          context: editor.getSelectionText(),
          content: editor.getSelectionText(),
        } as any;
        if (anchorRect.top < focusRect.top) {
          lastDom = focusDom;
          // result.begin = anchorDom;
          // result.end = focusDom;
        } else {
          lastDom = anchorDom;
          // result.begin = focusDom;
          // result.end = anchorDom;
        }
      }
      const placeholder = document.createElement('div') as HTMLElement;
      placeholder.id = '_ai_placeholder';
      insertAfter(placeholder, lastDom);
      result.placeholder = placeholder;
      props.onSelect(result);
    }
  });

  const onKeyDown = useEvent((e: any) => {
    const {code, key, keyCode} = e;
    if (code === 'Enter') {
      e.preventDefault();
      if (selectedKeys) {
        const key = selectedKeys[selectedKeys.length - 1];
        const item = itemsMap[key];
        if (item.disabled) {
          return;
        }
        if (item.children) {
          setOpenKeys([key]);
        } else {
          onSelect(key);
        }
      }
    } else if (code === 'ArrowDown' || code === 'ArrowUp') {
      const openned = openKeys?.[0];
      const group: any[] = (openned ? itemsMap[openned]?.children || [] : items).filter((item: any) => item.title);
      const selected = selectedKeys ? selectedKeys[selectedKeys.length - 1] : '';
      let curIndex = group.findIndex((item) => item.key === selected);
      let nextItem: any = null;
      if (code === 'ArrowDown') {
        do {
          nextItem = group[curIndex + 1];
          curIndex++;
        } while (nextItem?.disabled);
      } else if (code === 'ArrowUp') {
        do {
          nextItem = group[curIndex - 1];
          curIndex--;
        } while (nextItem?.disabled);
      }
      if (nextItem) {
        const newSelected = [...(selectedKeys || [])];
        if (nextItem.key.length > 1 && newSelected.length === 1) {
          newSelected.push(nextItem.key);
        } else {
          newSelected.pop();
          newSelected.push(nextItem.key);
        }
        setSelectedKeys(newSelected);
      }
      e.preventDefault();
    } else if (code === 'ArrowRight') {
      if (selectedKeys) {
        const key = selectedKeys[selectedKeys.length - 1];
        const item = itemsMap[key];
        if (item.children) {
          setOpenKeys([key]);
        }
      }
    } else if (code === 'ArrowLeft') {
      if (openKeys) {
        setOpenKeys(undefined);
        setSelectedKeys([selectedKeys![0]]);
      }
    } else if (keyCode > 10) {
      // event.editor.focus();
      // event.editor.insertText(key);
      // menuInput.current.focus();
    }
  });

  const onKeyChange = useEvent(({target}: {target: any}) => {
    if (compositionRef.current) {
      return;
    }
    const key = target.value;
    if (!key) {
      onCancel();
      return;
    }
    const {selected, openned} = searchShortcut(key);
    if (!selected) {
      onCancel();
      event.editor.insertText(key.substring(1));
      return;
    }
    setOpenKeys(openned);
    setSelectedKeys(selected);
  });

  const onComposition = useEvent((e: any) => {
    if (e.type === 'compositionend') {
      compositionRef.current = false;
      onKeyChange(e);
    } else {
      compositionRef.current = true;
    }
  });

  const onMenuSelect = useCallback(
    ({key, selectedKeys}: {key: string; selectedKeys: string[]}) => {
      setSelectedKeys(selectedKeys);
      onSelect(key);
    },
    [setSelectedKeys, onSelect]
  );

  const onMouseMove = useCallback((e: any) => {
    document.removeEventListener('mousemove', onMouseMove);
    removeClass(rootDivRef.current!, 'on');
  }, []);

  const curCmd = selectedKeys ? selectedKeys[1] || selectedKeys[0] : '';

  useEffect(() => {
    if (curCmd) {
      menuInput.current.value = '/' + curCmd.toLocaleLowerCase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curCmd]);

  useLayoutEffect(() => {
    const rootDiv = rootDivRef.current!;
    if (event.selectionRange) {
      const selectionRect = event.selectionRange.getBoundingClientRect();
      //console.log(selectionRect);
      const dTop = selectionRect.top;
      const dBottom = window.innerHeight - selectionRect.bottom;
      const menuHeight = rootDiv.offsetHeight;
      const menuPos = {top: 0, left: 0, pos: 'lt'};
      if (dTop > dBottom) {
        menuPos.top = Math.max(0, dTop - menuHeight);
        menuPos.pos = 'lt';
      } else {
        menuPos.top = Math.min(selectionRect.bottom, window.innerHeight - menuHeight);
        menuPos.pos = 'lb';
      }
      const selPos = event.editor.getSelectionPosition();
      const editorContainer = event.editor.getEditableContainer() as HTMLElement;
      const containerRect = editorContainer.getBoundingClientRect();
      if (selPos.left !== undefined) {
        menuPos.left = containerRect.left + parseInt(selPos.left);
      } else {
        menuPos.left = containerRect.left + containerRect.width - parseInt(selPos.right || '');
      }
      setMenuStyles(menuPos);
    }

    // const editor = event.editor;
    // const pos = editor.getSelectionPosition();
    // const posNum = {
    //   left: parseInt(pos.left || '0'),
    //   top: parseInt(pos.top || '0'),
    //   right: parseInt(pos.right || '0'),
    //   bottom: parseInt(pos.bottom || '0'),
    // };
    // //console.log(posNum);

    // const selPos = {x: 0, y: 0};
    // if (posNum.left) {
    //   selPos.x = posNum.left + containerRect.left;
    // } else if (posNum.right) {
    //   selPos.x = containerRect.left - posNum.right + containerRect.width + 8;
    // }
    // if (posNum.top) {
    //   selPos.y = posNum.top + containerRect.top;
    // } else if (posNum.bottom) {
    //   selPos.y = containerRect.height - posNum.bottom + containerRect.top + 35;
    // }
    // const menuPos = {left: 0, top: 0};
    // menuPos.left = selPos.x;
    // menuPos.top = selPos.y - 100;
    // const menuMaxTop = window.innerHeight - rootDiv.offsetHeight;
    // if (menuPos.top > menuMaxTop) {
    //   menuPos.top = menuMaxTop;
    // }
    // setMenuStyles(menuPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    menuInput.current.focus();
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootDivRef as any} className={styles.menu + ' on ' + menuStyles.pos} style={menuStyles} onMouseMove={onMouseMove}>
      <input
        ref={menuInput as any}
        defaultValue="/"
        onKeyDown={onKeyDown}
        onChange={onKeyChange}
        onCompositionStart={onComposition}
        onCompositionEnd={onComposition}
        onCompositionUpdate={onComposition}
      />
      <Menu
        mode="vertical"
        items={items as any}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        selectedKeys={selectedKeys}
        onSelect={onMenuSelect}
        rootClassName={styles.menuItem}
        //onClick={onMenuClick}
      />
    </div>
  );
};

export default memo(Component);
