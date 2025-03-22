import {AlignCenterOutlined, DatabaseOutlined, DeleteOutlined, EditOutlined, FileOutlined, HomeOutlined, StarOutlined} from '@ant-design/icons';
import {Button, Menu, MenuProps} from 'antd';
import {FC, useCallback, useState} from 'react';
import Logo from '@/assets/images/logo.svg';
import {GetClientRouter} from '@/Global';
import DocAPI from '@/modules/doc/api';
import {getUrlParam, message} from '@/utils/tools';
import styles from './index.module.less';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '首页',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: '我的文档',
    icon: <FileOutlined />,
    label: '我的文档',
  },
  {
    key: '我的收藏',
    icon: <StarOutlined />,
    label: '我的收藏',
  },
  {
    key: '回收站',
    label: '回收站',
    type: 'group',
  },
  {
    key: '知识管理',
    icon: <AlignCenterOutlined />,
    label: '知识管理',
  },
  {
    key: '模版管理',
    icon: <DatabaseOutlined />,
    label: '模版管理',
  },
];

const Component: FC<{}> = () => {
  const pathname = GetClientRouter().location.pathname;
  const app = getUrlParam('app');
  const [loading, setLoading] = useState<'create' | 'list' | ''>('');

  const onCreate = useCallback(() => {
    const btn = document.getElementById('_create-doc-btn');
    if (btn) {
      btn.click();
    } else {
      setLoading('create');
      DocAPI.createDoc({folder: '0', contents: ''})
        .then(({id}) => {
          GetClientRouter().push({url: `/admin/doc/item/edit?id=${id}&__c=_dialog`}, 'window');
        })
        .catch((e) => {
          message.error(e + '');
        })
        .finally(() => setLoading(''));
    }
  }, []);

  return (
    <div className={styles.root}>
      <div className="hd">
        <img className="logo" src={Logo} />
        <span className="title">梦笔公文</span>

        <Button className="writer" block type="primary" icon={<EditOutlined />} onClick={onCreate} loading={loading === 'create'}>
          开始写作
        </Button>
      </div>
      <div className="bd">
        <Menu mode="inline" items={items} />
      </div>
      {/* <ul>
        <li className={pathname.startsWith('/admin/doc/list/maintain') ? 'on' : ''} onClick={() => onClick(`/admin/doc/list/maintain?app=${app}`)}>
          <FileTextOutlined />
          <div>我的文档</div>
        </li>
        <li className={pathname.startsWith('/admin/flow/list/flowmain') ? 'on' : ''}>
          <FormOutlined />
          <div>知识库</div>
        </li>
      </ul> */}
    </div>
  );
};

export default Component;
