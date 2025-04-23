import {AlignCenterOutlined, DatabaseOutlined, EditOutlined, FileOutlined, HomeOutlined, StarOutlined} from '@ant-design/icons';
import {Link} from '@elux/react-web';
import {Button, Menu} from 'antd';
import {FC, useCallback, useMemo, useState} from 'react';
import Logo from '@/assets/images/logo.svg';
import {GetClientRouter} from '@/Global';
import DocAPI from '@/modules/doc/api';
import {getUrlParam, message, useEvent} from '@/utils/tools';
import styles from './index.module.less';

const items: any[] = [
  {
    key: '首页',
    icon: <HomeOutlined />,
    label: (
      <Link to="/admin/home" action="relaunch" target="window">
        首页
      </Link>
    ),
    url: '/',
  },
  {
    key: '我的文档',
    icon: <FileOutlined />,
    label: (
      <Link to="admin/doc/list/maintain" action="relaunch" target="window">
        我的文档
      </Link>
    ),
  },
  {
    key: '我的收藏',
    icon: <StarOutlined />,
    label: (
      <Link to="admin/doc/list/favs" action="relaunch" target="window">
        我的收藏
      </Link>
    ),
  },
  // {
  //   key: '回收站',
  //   label: '回收站',
  //   type: 'group',
  // },
  // {
  //   key: '知识管理',
  //   icon: <AlignCenterOutlined />,
  //   label: '知识管理',
  // },
  // {
  //   key: '模版管理',
  //   icon: <DatabaseOutlined />,
  //   label: '模版管理',
  // },
];

const Component: FC<{}> = () => {
  const pathname = GetClientRouter().location.pathname;
  const selectedKeys = useMemo(() => {
    if (pathname.startsWith('/admin/doc/list/maintain')) {
      return ['我的文档'];
    }
    if (pathname.startsWith('/admin/doc/list/favs')) {
      return ['我的收藏'];
    }
    if (pathname.startsWith('/admin/home')) {
      return ['首页'];
    }
    return [];
  }, [pathname]);

  const [loading, setLoading] = useState<'create' | 'list' | ''>('');

  const onCreate = useCallback(() => {
    const btn = document.getElementById('_create-doc-btn');
    if (btn) {
      btn.click();
    } else {
      setLoading('create');
      DocAPI.createDoc({folder: '0', title: '', contents: ''})
        .then(({id}) => {
          GetClientRouter().push({url: `/admin/doc/item/edit/${id}?__c=_dialog`}, 'window');
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
        <Menu mode="inline" items={items} selectedKeys={selectedKeys} />
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
