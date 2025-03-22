import {
  DatabaseOutlined,
  EditOutlined,
  FileTextOutlined,
  LinkOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  PictureOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import {Boot, IDomEditor, IModalMenu, SlateNode} from '@wangeditor-next/editor';
import {Button, Divider, Menu} from 'antd';
import {FC, ReactNode, memo, useEffect, useMemo, useRef, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import AiIcon from '../AIcon';
import AIContinue from '../AIContinue';
import AIDialog from '../AIDialog';
import {RunningState} from '../api';
import styles from './index.module.less';
import type {MenuProps} from 'antd';

export interface ISelection {
  pos: {x: number; y: number};
}

export interface IAIRef {
  closeMenu: () => void;
  openMenu: (selection: ISelection | undefined) => void;
  menuIsOpen: () => boolean;
  insertHtml: (html: string) => void;
}

interface Props {
  onCreated: (ref: IAIRef) => void;
  editor: IDomEditor;
}

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '0',
    label: '辅助创作',
    type: 'group',
  },
  {
    key: 'AIContinue',
    icon: <EditOutlined />,
    label: '继续写',
  },
  {
    key: 'outline',
    icon: <MenuUnfoldOutlined />,
    label: '生成大纲',
  },
  {
    key: 'polish',
    icon: (
      <span>
        <AiIcon />
      </span>
    ),
    label: '帮我润色',
    children: [
      {key: '1', label: '更专业'},
      {key: '2', label: '更轻松'},
      {key: '3', label: '更直白'},
      {key: '4', label: '更自信'},
      {key: '5', label: '更友好'},
    ],
  },
  {
    key: 'streamline',
    icon: <FileTextOutlined />,
    label: '精简内容',
  },
  {
    key: 'abstract',
    icon: <DatabaseOutlined />,
    label: '生成摘要',
  },
  {
    key: 'check',
    icon: <ReadOutlined />,
    label: '校阅',
  },
  {
    key: 'photo',
    icon: <PictureOutlined />,
    label: '生成图片',
  },
  {
    type: 'divider',
  },
  {
    key: 'ask',
    icon: <MessageOutlined />,
    label: '提问',
  },
  {
    key: 'summarize',
    icon: <LinkOutlined />,
    label: '总结网页',
  },
];
const Component: FC<Props> = ({onCreated, editor}) => {
  const [selection, setSelection] = useState<ISelection>();
  const [showDialog, setShowDialog] = useState<'AIContinue'>();
  const [runningState, setRunningState] = useState<RunningState>('');
  const menuDiv = useRef<HTMLDivElement>(null as any);

  const openMenu = useEvent((selection: ISelection | undefined) => {
    editor.blur();
    setSelection(selection);
    setShowDialog(undefined);
  });

  const closeMenu = useEvent(() => {
    if (runningState === 'Pending') {
      message.warning('正在执行...请先停止当前任务!');
      editor.blur();
      return;
    }
    setSelection(undefined);
    setShowDialog(undefined);
    editor.focus();
  });

  const onMenuClick: MenuProps['onClick'] = useEvent(({key}: any) => {
    console.log('click', key);
    setShowDialog(key);
  });

  const menuIsOpen = useEvent(() => {
    return !!selection;
  });

  const insertHtml = useEvent((html: string) => {
    return editor.dangerouslyInsertHtml(html);
  });

  const {menuPos, dialogPos} = useMemo(() => {
    const menuPos = {left: 0, top: 0};
    const dialogPos = {top: 0};
    if (selection) {
      const selectionPos = selection.pos;
      menuPos.left = selectionPos.x;
      menuPos.top = selectionPos.y - 100;
      const menuHeight = 450;
      const menuMaxTop = window.innerHeight - menuHeight;
      if (menuPos.top > menuMaxTop) {
        menuPos.top = menuMaxTop;
      }
      const selectionBottom = window.innerHeight - selectionPos.y;
      dialogPos.top = selectionPos.y < selectionBottom ? selectionPos.y : -selectionBottom - 36;
    }
    return {menuPos, dialogPos};
  }, [selection]);

  const aiRef: IAIRef = useMemo(() => {
    return {openMenu, closeMenu, menuIsOpen, insertHtml};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onCreated(aiRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selection) {
    return null;
  }

  return (
    <>
      {showDialog === 'AIContinue' ? (
        <AIDialog top={dialogPos.top} footer={true}>
          <AIContinue aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      ) : (
        <div className={styles.menu} style={menuPos} ref={menuDiv}>
          <Menu mode="vertical" items={items} onClick={onMenuClick} />
        </div>
      )}
      <div className={styles.mask + ' ' + runningState} onClick={closeMenu}></div>
    </>
  );
};

export default memo(Component);
