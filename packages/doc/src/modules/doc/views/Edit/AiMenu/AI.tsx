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
import {IDomEditor} from '@wangeditor-next/editor';
import {Menu} from 'antd';
import {memo, useEffect, useMemo, useState} from 'react';
import {useEvent} from '@/utils/tools';
import AiIcon from '../AIcon';
import ContinueDialog from './ContinueDialog';
import type {MenuProps} from 'antd';

export interface Selection {
  pos: {left: number; top: number; bottom: number};
}

export interface AIRef {
  setSelection: (selection: Selection | null) => void;
}

interface Props {
  editor: IDomEditor;
  initSelection: Selection | null;
  onCreated: (ref: AIRef) => void;
}

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '0',
    label: '辅助创作',
    type: 'group',
  },
  {
    key: 'ContinueDialog',
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

function Component({editor, initSelection, onCreated}: Props) {
  const [selection, setSelection] = useState<Selection | null>(initSelection);
  const [showDialog, setShowDialog] = useState<'ContinueDialog'>();
  const [editorContainer] = useState(() => editor.getEditableContainer() as HTMLElement);

  const dialogPos = useMemo(() => {
    if (selection) {
      const containerRect = editorContainer.getBoundingClientRect();
      const selectionPos = selection.pos;
      let selectionTop = 0;
      if (selectionPos.top) {
        selectionTop = selectionPos.top + containerRect.top;
      } else if (selectionPos.bottom) {
        selectionTop = containerRect.height - selectionPos.bottom + containerRect.top + 35;
      }
      const selectionBottom = window.innerHeight - selectionTop;
      console.log(selectionPos, selectionTop, selectionBottom, selectionTop < selectionBottom ? selectionTop : -selectionBottom - 35);
      return selectionTop < selectionBottom ? selectionTop : -selectionBottom - 35;
    }
    return 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const onInsertAI = useEvent((html: string) => {
    editor.hidePanelOrModal();
    editor.focus();
    const domSelection = document.getSelection();
    const curText = domSelection?.anchorNode?.textContent || '';
    const indexText = domSelection?.anchorOffset || 0;
    console.log(curText, indexText);
    if (curText.charAt(indexText - 1) === '/') {
      editor.deleteBackward('character');
    }
    editor.dangerouslyInsertHtml(html);
  });

  const onClick: MenuProps['onClick'] = useEvent(({key}: any) => {
    console.log('click', key);
    const modal = document.getElementById('_ai_modal')!.parentNode! as HTMLElement;
    // const modalRect = modal.getBoundingClientRect();
    // const pos = editor.getSelectionPosition();
    // console.log(modalRect.y, pos.top);
    setShowDialog(key);
    modal.style.left = '-200%';
  });

  const mounted = !!selection;
  useMemo(() => {
    if (!mounted) {
      setShowDialog(undefined);
    }
  }, [mounted]);

  useEffect(() => {
    onCreated({setSelection});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showDialog) {
    return showDialog === 'ContinueDialog' ? <ContinueDialog top={dialogPos} /> : null;
  } else {
    return <Menu onClick={onClick} mode="vertical" items={items} />;
  }
}

export default memo(Component);
