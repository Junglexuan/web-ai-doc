import {Dispatch, Link, Switch, connectStore} from '@elux/react-web';
import {Button, Dropdown, Space} from 'antd';
import {FC, useMemo} from 'react';
import ErrorPage from '@/components/ErrorPage';
import {APPState, LoadComponent} from '@/Global';
import {CurUser, InIframe} from '@/utils/base';
import {SubModule} from '../../entity';
import styles from './index.module.less';

const MenuItems = {
  items: [
    {
      key: '首页',
      label: (
        <Link to="/admin/home" action="relaunch" target="window">
          首页
        </Link>
      ),
      url: '/',
    },
    {
      key: '我的文档',
      label: (
        <Link to="/admin/doc/list/maintain" action="relaunch" target="window">
          我的文档
        </Link>
      ),
    },
    {
      key: '我的收藏',
      label: (
        <Link to="/admin/doc/list/favs" action="relaunch" target="window">
          我的收藏
        </Link>
      ),
    },
    {
      key: '模版管理',
      label: (
        <Link to="/admin/doc/list/tpls" action="relaunch" target="window">
          模版管理
        </Link>
      ),
    },
    {
      key: '我的合同',
      label: (
        <Link to="/admin/doc/list/conts" action="relaunch" target="window">
          我的合同
        </Link>
      ),
    },
    {
      key: '合同审查规则',
      label: (
        <Link to="/admin/contractReview/list/maintain" action="relaunch" target="window">
          审查规则
        </Link>
      ),
    },
    {
      key: '尽调管理',
      label: (
        <Link to="/admin/dueDiligence/list/maintain" action="relaunch" target="window">
          尽调管理
        </Link>
      ),
    },
    {
      key: '尽调设置',
      label: (
        <Link to="/admin/dueDiligence/config/setting" action="relaunch" target="window">
          尽调设置
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
    },
  ],
};

const SubModuleViews: {[moduleName: string]: () => JSX.Element} = Object.keys(SubModule).reduce((cache: any, moduleName) => {
  cache[moduleName] = LoadComponent(moduleName as any, 'main');
  return cache;
}, {});

export interface StoreProps {
  curUser: CurUser;
  dialogMode: boolean;
  subModule?: SubModule;
}

function mapStateToProps(appState: APPState): StoreProps {
  const {curUser} = appState.stage!;
  const {subModule, dialogMode} = appState.admin!;
  return {curUser, subModule, dialogMode};
}

const Component: FC<StoreProps & {dispatch: Dispatch}> = ({curUser, subModule, dialogMode, dispatch}) => {
  const content = useMemo(
    () => (
      <Switch elseView={<ErrorPage />}>
        {subModule &&
          Object.keys(SubModule).map((moduleName) => {
            if (subModule === moduleName) {
              const SubView = SubModuleViews[subModule];
              return <SubView key={moduleName} />;
            } else {
              return null;
            }
          })}
      </Switch>
    ),
    [subModule]
  );

  if (!curUser.hasLogin) {
    return null;
  }
  if (dialogMode) {
    return content;
  }
  return (
    <div className={styles.root}>
      <div className="page">{content}</div>
      {!InIframe && (
        <Dropdown menu={MenuItems}>
          <Button style={{position: 'fixed', bottom: '10px'}}>menu</Button>
        </Dropdown>
      )}
    </div>
  );
};

export default connectStore(mapStateToProps)(Component);
