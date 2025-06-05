import {DatabaseOutlined, EditOutlined, FileOutlined, HomeOutlined, SettingOutlined, StarOutlined} from '@ant-design/icons';
import {Link} from '@elux/react-web';
import {Button, Menu} from 'antd';
import {FC, useCallback, useEffect, useMemo, useState} from 'react';
import ASK from '@/assets/images/ask';
import Logo from '@/assets/images/logo.svg';
import TPL from '@/assets/images/tpl';
import ZSK from '@/assets/images/zsk';
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
    icon: <DatabaseOutlined />,
    label: (
      <Link to="/admin/doc/list/tpls" action="relaunch" target="window">
        模版管理
      </Link>
    ),
  },
  {
    key: '回收站',
    label: (
      <Link to="/admin/doc/list/recs" action="relaunch" target="window">
        回收站
      </Link>
    ),
    type: 'group',
  },
  {
    key: '知识库',
    icon: <ZSK />,
    label: <a href={KnowledgePrefix + '/knowledge'}>知识库</a>,
  },
  {
    key: '知识问答',
    icon: <ASK />,
    label: <a href={KnowledgePrefix + '/chat'}>知识问答</a>,
  },
  {
    key: '文件管理',
    icon: <TPL />,
    label: <a href={KnowledgePrefix + '/file'}>文件管理</a>,
  },
  {
    key: '模型管理',
    icon: <SettingOutlined />,
    label: <a href={KnowledgePrefix + '/user-setting/model'}>模型管理</a>,
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
