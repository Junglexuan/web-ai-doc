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
import {Menu, MenuProps} from 'antd';
import {FC, memo, useCallback, useEffect, useRef, useState} from 'react';
import {useEvent} from '@/utils/tools';
import AiIcon from '../AIcon';
import styles from './index.module.less';

export const MenuHeight = 560;

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
    key: 'RZY',
    title: '更专业',
    label: (
      <span>
        <sub>(ZY)</sub>更专业
      </span>
    ),
  },
  {
    key: 'RQS',
    title: '更轻松',
    label: (
      <span>
        <sub>(QS)</sub>更轻松
      </span>
    ),
  },
  {
    key: 'RZB',
    title: '更直白',
    label: (
      <span>
        <sub>(ZB)</sub>更直白
      </span>
    ),
  },
  {
    key: 'RZX',
    title: '更自信',
    label: (
      <span>
        <sub>(ZX)</sub>更自信
      </span>
    ),
  },
  {
    key: 'RYH',
    title: '更友好',
    label: (
      <span>
        <sub>(YH)</sub>更友好
      </span>
    ),
  },
];

const items: MenuItem[] = [
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
  {
    key: 'G',
    icon: <WalletOutlined />,
    title: '法定公文',
    label: (
      <span>
        <sub>(G)</sub>法定公文
      </span>
    ),
    children: officialTemplates,
  },
  {
    key: 'Y',
    icon: <TagOutlined />,
    title: '规范应用',
    label: (
      <span>
        <sub>(Y)</sub>规范应用
      </span>
    ),
    children: applicationTemplates,
  },
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
  items
    .concat(officialTemplates)
    .concat(applicationTemplates)
    .concat(stylesTemplates)
    .forEach((item) => {
      const key = item!.key as string;
      map[key] = item;
    });
  return map;
})();

function searchShortcut(key: string) {
  const result: {selected?: string[]; openned?: string[]} = {selected: undefined, openned: undefined};
  const key1 = key.charAt(1).toUpperCase();
  const key2 = key.substring(2, key.length).toUpperCase();
  const item1 = itemsMap[key1];
  if (item1?.title) {
    result.selected = [item1.key];
    if (item1?.children) {
      result.openned = [item1.key];
      if (key2) {
        const item2 = itemsMap[key1 + key2];
        if (item2?.title) {
          result.selected.push(key1 + key2);
        }
      }
    }
  }
  return result;
}

interface Props {
  menuPos: {
    left: number;
    top: number;
  };
  onSelect: (key: string) => void;
  onCancel: () => void;
}

const Component: FC<Props> = ({menuPos, onSelect, onCancel}) => {
  const menuInput = useRef<HTMLInputElement>(null as any);
  const menuComp = useRef<any>(null as any);
  const [openKeys, setOpenKeys] = useState<string[]>();
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(['C']);

  const onKeyDown = useEvent((e: any) => {
    const {code} = e;
    if (code === 'Enter') {
      if (selectedKeys) {
        const key = selectedKeys[selectedKeys.length - 1];
        const item = itemsMap[key];
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
      const curIndex = group.findIndex((item) => item.key === selected);
      let nextItem: any = null;
      if (code === 'ArrowDown') {
        nextItem = group[curIndex + 1];
      } else if (code === 'ArrowUp') {
        nextItem = group[curIndex - 1];
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
    }
  });

  const onKeyChange = useEvent(({target}: {target: any}) => {
    const key = target.value;
    if (!key) {
      onCancel();
      return;
    }
    const {selected, openned} = searchShortcut(key);
    setOpenKeys(openned);
    setSelectedKeys(selected);
    // const l1 = key.charAt(1);
    // console.log(l1);
  });

  const onMenuClick: MenuProps['onClick'] = useCallback(
    ({key}: any) => {
      console.log('click', key);
      onSelect(key);
    },
    [onSelect]
  );

  const onMenuSelect = useCallback(
    ({key, selectedKeys}: any) => {
      console.log('onMenuSelect', key, selectedKeys);
      setSelectedKeys(selectedKeys);
    },
    [setSelectedKeys]
  );

  useEffect(() => {
    menuInput.current.focus();
  }, []);

  return (
    <div className={styles.menu} style={menuPos}>
      <input ref={menuInput as any} defaultValue="/" onKeyDown={onKeyDown} onChange={onKeyChange} />
      <Menu
        ref={menuComp}
        mode="vertical"
        items={items as any}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        selectedKeys={selectedKeys}
        onSelect={onMenuSelect}
        //onClick={onMenuClick}
      />
    </div>
  );
};

export default memo(Component);
