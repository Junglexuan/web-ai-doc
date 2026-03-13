import {Dispatch, Switch, connectStore} from '@elux/react-web';
import {FC, useMemo} from 'react';
import ErrorPage from '@/components/ErrorPage';
import {APPState, GetClientRouter, LoadComponent, PathPrefix} from '@/Global';
import {CurUser, InIframe} from '@/utils/base';
import {SubModule} from '../../entity';
import Header from '../Header';
import Menu from '../Menu';
import styles from './index.module.less';

/** 尽调溯源页可免登录访问，需在此处放行渲染 */
const TRACE_PAGE_PREFIX = '/admin/dueDiligence/list/trace';

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
  const pathname = GetClientRouter().location.pathname;
  const pathWithoutPrefix = (pathname || '').replace(PathPrefix, '');
  const isTracePage = pathWithoutPrefix.startsWith(TRACE_PAGE_PREFIX);

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

  if (!curUser.hasLogin && !isTracePage) {
    return null;
  }
  if (dialogMode) {
    return content;
  }
  return (
    <div className={styles.root + (InIframe ? ' in-iframe' : '')}>
      {!InIframe && (
        <div className="side">
          <Menu />
        </div>
      )}
      <div className="content">
        <div className={styles.doc} style={{paddingTop: InIframe ? 0 : undefined}}>
          {!InIframe && curUser.hasLogin && (
            <div className="head">
              <Header curUser={curUser} dispatch={dispatch} />
            </div>
          )}
          <div className="body">{content}</div>
        </div>
      </div>
    </div>
  );
};

export default connectStore(mapStateToProps)(Component);
