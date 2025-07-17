import {AppstoreOutlined, EditOutlined, SafetyCertificateOutlined} from '@ant-design/icons';
import {Link} from '@elux/react-web';
import {Button, Menu} from 'antd';
import {FC, useCallback, useEffect, useMemo, useState} from 'react';
import AskOutlined from '@/assets/images/ask';
import BarChartOutlined from '@/assets/images/Chart';
import Delete from '@/assets/images/Delete';
import FileOutlined from '@/assets/images/Doc';
import HomeOutlined from '@/assets/images/Home';
import Logo from '@/assets/images/logo.svg';
import StarOutlined from '@/assets/images/Star';
import TPL from '@/assets/images/tpl';
import {GetClientRouter, KnowledgePrefix} from '@/Global';
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
    key: '合同审查规则',
    icon: <SafetyCertificateOutlined />,
    label: (
      <Link to="/admin/contractReview/list/maintain" action="relaunch" target="window">
        合同审查规则
      </Link>
    ),
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
      DocAPI.createDoc({folder: '0', title: '', contents: ''})
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
        <img className="logo" src={Logo} />
        <span className="title">星启·文枢</span>
        <Button className="writer" block type="primary" icon={<EditOutlined />} onClick={onCreate} loading={loading === 'create'}>
          开始写作
        </Button>
      </div>
      <div className="bd">
        <Menu mode="inline" items={items} selectedKeys={selectedKeys} />
      </div>
      <div className="ft">
        <a target="_blank" title="智能体平台" href="//pulse.binarysee.com" rel="noreferrer">
          <AskOutlined className="icon" />
          <span>星启·脉擎</span>
        </a>
        <a target="_blank" title="数据智能体" href="//helix.binarysee.com" rel="noreferrer">
          <BarChartOutlined className="icon" />
          <span>星启·数璇</span>
        </a>
      </div>
    </div>
  );
};

export default Component;
