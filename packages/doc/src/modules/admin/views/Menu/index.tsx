import {EditOutlined, SafetyCertificateOutlined} from '@ant-design/icons';
import {Link} from '@elux/react-web';
import {Button, Menu} from 'antd';
import {FC, ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import AskOutlined from '@/assets/images/ask';
import BarChartOutlined from '@/assets/images/Chart';
import Delete from '@/assets/images/Delete';
import FileOutlined from '@/assets/images/Doc';
import HomeOutlined from '@/assets/images/Home';
import StarOutlined from '@/assets/images/Star';
import TPL from '@/assets/images/tpl';
import {GetClientRouter, SiteInfo, SitesUrl} from '@/Global';
import DocAPI from '@/modules/doc/api';
import {getUrlParam} from '@/utils/tools';
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
      <Link to="/admin/doc/list/maintain" action="relaunch" target="window">
        我的文档
      </Link>
    ),
  },
  {
    key: '我的收藏',
    icon: <StarOutlined />,
    label: (
      <Link to="/admin/doc/list/favs" action="relaunch" target="window">
        我的收藏
      </Link>
    ),
  },
  {
    key: '模版管理',
    icon: <TPL />,
    label: (
      <Link to="/admin/doc/list/tpls" action="relaunch" target="window">
        模版管理
      </Link>
    ),
  },
  {
    type: 'divider',
  },
  {
    key: '我的合同',
    icon: <SafetyCertificateOutlined />,
    label: (
      <Link to="/admin/doc/list/conts" action="relaunch" target="window">
        我的合同
      </Link>
    ),
  },
  {
    key: '合同审查规则',
    icon: <SafetyCertificateOutlined />,
    label: (
      <Link to="/admin/contractReview/list/maintain" action="relaunch" target="window">
        审查规则
      </Link>
    ),
  },
  {
    type: 'divider',
  },
  {
    key: '回收站',
    icon: <Delete />,
    label: (
      <Link to="/admin/doc/list/recs" action="relaunch" target="window">
        回收站
      </Link>
    ),
  },
];

const Sites: {[key: string]: ReactNode} = {
  pulse: (
    <a key="pulse" target="_blank" title="智能体平台" href={SitesUrl.pulse} rel="noreferrer">
      <AskOutlined className="icon" />
      <span>{SiteInfo.sites?.pulse}</span>
    </a>
  ),
  helix: (
    <a key="helix" target="_blank" title="数据智能体" href={SitesUrl.helix} rel="noreferrer">
      <BarChartOutlined className="icon" />
      <span>{SiteInfo.sites?.helix}</span>
    </a>
  ),
};

const Component: FC<{}> = () => {
  const pathname = GetClientRouter().location.pathname;
  const selectedKeys = useMemo(() => {
    if (pathname.startsWith('/admin/doc/list/maintain')) {
      return ['我的文档'];
    }
    if (pathname.startsWith('/admin/doc/list/favs')) {
      return ['我的收藏'];
    }
    if (pathname.startsWith('/admin/doc/list/recs')) {
      return ['回收站'];
    }
    if (pathname.startsWith('/admin/doc/list/tpls')) {
      return ['模版管理'];
    }
    if (pathname.startsWith('/admin/doc/list/conts')) {
      return ['我的合同'];
    }
    if (pathname.startsWith('/admin/contractReview')) {
      return ['合同审查规则'];
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
      DocAPI.createDoc({folder: '0', title: '', contents: ''}, 'doc')
        .then(({id}) => {
          GetClientRouter().push({url: `/admin/doc/item/edit/${id}?__c=_dialog`}, 'window');
        })
        .finally(() => setLoading(''));
    }
  }, []);

  useEffect(() => {
    const auicklyCreate = getUrlParam('auicklyCreate');
    if (auicklyCreate) {
      onCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.root}>
      <div className="hd">
        <img className="logo" src={SiteInfo.logo} />
        <span className="title">{SiteInfo.name}</span>
        <Button className="writer" block type="primary" icon={<EditOutlined />} onClick={onCreate} loading={loading === 'create'}>
          开始写作
        </Button>
      </div>
      <div className="bd">
        <Menu mode="inline" items={items} selectedKeys={selectedKeys} />
      </div>
      {SiteInfo.sites && <div className="ft">{Object.keys(SiteInfo.sites).map((key) => Sites[key])}</div>}
    </div>
  );
};

export default Component;
