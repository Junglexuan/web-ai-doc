import {MessageOutlined} from '@ant-design/icons';
import {Link} from '@elux/react-web';
import {Menu} from 'antd';
import {FC, useMemo} from 'react';
import HomeOutlined from '@/assets/images/Home';
import {GetClientRouter, SiteInfo} from '@/Global';
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
    type: 'divider',
  },
  {
    key: '尽调管理',
    icon: <MessageOutlined />,
    label: (
      <Link to="/admin/dueDiligence/list/maintain" action="relaunch" target="window">
        尽调管理
      </Link>
    ),
  },
  {
    key: '尽调设置',
    icon: <MessageOutlined />,
    label: (
      <Link to="/admin/dueDiligence/config/setting" action="relaunch" target="window">
        尽调设置
      </Link>
    ),
  },
];

const Component: FC<{}> = () => {
  const pathname = GetClientRouter().location.pathname;
  const selectedKeys = useMemo(() => {
    if (pathname.startsWith('/admin/home')) {
      return ['首页'];
    }
    if (pathname.startsWith('/admin/dueDiligence/list/maintain')) {
      return ['尽调管理'];
    }
    if (pathname.startsWith('/admin/dueDiligence/config/setting')) {
      return ['尽调设置'];
    }
    return [];
  }, [pathname]);

  return (
    <div className={styles.root}>
      <div className="hd">
        <img className="logo" src={SiteInfo.logo} />
        <span className="title">{SiteInfo.name}</span>
      </div>
      <div className="bd">
        <Menu mode="inline" items={items} selectedKeys={selectedKeys} />
      </div>
    </div>
  );
};
export default Component;
