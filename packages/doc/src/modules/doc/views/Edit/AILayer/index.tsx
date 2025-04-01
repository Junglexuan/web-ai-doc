import {
  DatabaseOutlined,
  EditOutlined,
  FileTextOutlined,
  LinkOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  PictureOutlined,
  ReadOutlined,
  TagOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {Boot, IDomEditor, IModalMenu, SlateNode} from '@wangeditor-next/editor';
import {Button, Divider, Menu} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import AiIcon from '../AIcon';
import AIContinue from '../AIContinue';
import AIDialog from '../AIDialog';
import AIOutline from '../AIOutline';
import AITemplate from '../AITemplate';
import {RunningState} from '../api';
import {getSelectionContext} from '../utils';
import styles from './index.module.less';
import type {MenuProps} from 'antd';

export interface ISelection {
  pos: {x: number; y: number};
  context: string;
}

export interface IAIRef {
  closeMenu: () => void;
  openMenu: (selection: ISelection | undefined) => void;
  menuIsOpen: () => boolean;
  insertHtmlByAI: (html: string) => void;
  getTitle: () => string;
  getDocId: () => string;
  getContext: () => string;
}

interface Props {
  onCreated: (ref: IAIRef) => void;
  editor: IDomEditor;
}

type MenuItem = Required<MenuProps>['items'][number];

const officialTemplates = [
  {key: '意见', value: '意见', label: '意见'},
  {key: '决定', value: '决定', label: '决定'},
  {key: '决议', value: '决议', label: '决议'},
  {key: '函', value: '函', label: '函'},
  {key: '批复', value: '批复', label: '批复'},
  {key: '请示', value: '请示', label: '请示'},
  {key: '报告', value: '报告', label: '报告'},
  {key: '通报', value: '通报', label: '通报'},
  {key: '通知', value: '通知', label: '通知'},
  {key: '通告', value: '通告', label: '通告'},
  {key: '公告', value: '公告', label: '公告'},
  {key: '纪要', value: '纪要', label: '纪要'},
  {key: '公报', value: '公报', label: '公报'},
  {key: '议案', value: '议案', label: '议案'},
  {key: '命令', value: '命令', label: '命令'},
];

const applicationTemplates = [
  {key: '声明', value: '声明', label: '声明'},
  {key: '总结', value: '总结', label: '总结'},
  {key: '计划', value: '计划', label: '计划'},
  {key: '规划', value: '规划', label: '规划'},
  {key: '安排', value: '安排', label: '安排'},
  {key: '公示', value: '公示', label: '公示'},
  {key: '启事', value: '启事', label: '启事'},
  {key: '细则', value: '细则', label: '细则'},
  {key: '守则', value: '守则', label: '守则'},
  {key: '章程', value: '章程', label: '章程'},
  {key: '办法', value: '办法', label: '办法'},
  {key: '规定', value: '规定', label: '规定'},
  {key: '条例', value: '条例', label: '条例'},
];

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
    key: 'AIOutline',
    icon: <MenuUnfoldOutlined />,
    label: '生成大纲',
  },
  {
    key: 'official',
    icon: <WalletOutlined />,
    label: '法定公文',
    children: officialTemplates,
  },
  {
    key: 'application',
    icon: <TagOutlined />,
    label: '规范应用',
    children: applicationTemplates,
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

const MenuHeight = 530;

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

  const insertHtmlByAI = useEvent((html: string) => {
    const domSelection = document.getSelection();
    const curText = domSelection?.anchorNode?.textContent || '';
    const indexText = domSelection?.anchorOffset || 0;
    console.log(curText, indexText);
    if (curText.charAt(indexText - 1) === '/') {
      editor.deleteBackward('character');
    }
    editor.dangerouslyInsertHtml(html);
    //return editor.dangerouslyInsertHtml(html);
  });

  const getTitle = useEvent(() => {
    const input: HTMLInputElement = document.getElementById('_doc_title') as any;
    return input?.value;
  });

  const getDocId = useEvent(() => {
    const input: HTMLInputElement = document.getElementById('_doc_title') as any;
    return input?.getAttribute('data-doc') || '';
  });

  const getContext = useEvent(() => {
    return selection!.context;
  });

  const {menuPos, dialogPos} = useMemo(() => {
    const menuPos = {left: 0, top: 0};
    const dialogPos = {top: 0};
    if (selection) {
      const selectionPos = selection.pos;
      menuPos.left = selectionPos.x;
      menuPos.top = selectionPos.y - 100;

      const menuMaxTop = window.innerHeight - MenuHeight;
      if (menuPos.top > menuMaxTop) {
        menuPos.top = menuMaxTop;
      }
      const selectionBottom = window.innerHeight - selectionPos.y;
      dialogPos.top = selectionPos.y < selectionBottom ? selectionPos.y : -selectionBottom - 36;
    }
    return {menuPos, dialogPos};
  }, [selection]);

  const aiRef: IAIRef = useMemo(() => {
    return {openMenu, closeMenu, menuIsOpen, insertHtmlByAI, getTitle, getDocId, getContext};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aiDialog = useMemo(() => {
    if (showDialog === 'AIContinue') {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AIContinue aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (showDialog === 'AIOutline') {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AIOutline aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (officialTemplates.some((item) => item.key === showDialog)) {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AITemplate templateOptions={officialTemplates} template={showDialog!} aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    if (applicationTemplates.some((item) => item.key === showDialog)) {
      return (
        <AIDialog top={dialogPos.top} footer={true}>
          <AITemplate templateOptions={applicationTemplates} template={showDialog!} aiRef={aiRef} onRunningStateChange={setRunningState} />
        </AIDialog>
      );
    }
    return (
      <div className={styles.menu} style={menuPos} ref={menuDiv}>
        <Menu mode="vertical" items={items} onClick={onMenuClick} />
      </div>
    );
  }, [aiRef, dialogPos.top, menuPos, onMenuClick, showDialog]);

  useEffect(() => {
    onCreated(aiRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selection) {
    return null;
  }

  return (
    <>
      {aiDialog}
      <div className={styles.mask + ' ' + runningState} onClick={closeMenu}></div>
    </>
  );
};

export default memo(Component);
