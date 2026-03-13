import '@wangeditor-next/editor/dist/css/style.css';
import '@/assets/css/global.module.less';
import '@/assets/css/editor.less';
import {Dispatch, DocumentHead, LoadingState, Switch, connectStore} from '@elux/react-web';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import {FC} from 'react';
import ErrorPage from '@/components/ErrorPage';
import LoadingPanel from '@/components/LoadingPanel';
import {APPState, LoadComponent, PathPrefix, SiteInfo, useRouter} from '@/Global';
import {CurView, SubModule} from '../entity';
import LoginForm from './LoginForm';

const TRACE_PAGE_PREFIX = '/admin/dueDiligence/list/trace';
const Admin = LoadComponent('admin', 'main');
const DueDiligenceMain = LoadComponent('dueDiligence', 'main');

export interface StoreProps {
  subModule?: SubModule;
  curView?: CurView;
  globalLoading?: LoadingState;
  error?: string;
}

function mapStateToProps(appState: APPState): StoreProps {
  const {subModule, curView, globalLoading, error} = appState.stage!;
  return {
    subModule,
    curView,
    globalLoading,
    error,
  };
}

const defaultTheme: any = {
  token: {
    colorPrimary: '#1B68FC',
    colorFillContentHover: 'red',
    colorBgLayout: '#EEF0F5',
    borderRadius: 4,
  },
};

const Component: FC<StoreProps & {dispatch: Dispatch}> = ({dispatch, subModule, curView, globalLoading, error}) => {
  const router = useRouter();
  const pathname = router?.location?.pathname || '';
  const pathWithoutPrefix = pathname.replace(PathPrefix, '');
  const isTracePage = pathWithoutPrefix.startsWith(TRACE_PAGE_PREFIX);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1B68FC',
          //colorBgLayout: '#EEF0F5',
          borderRadius: 4,
        },
        components: {
          Menu: {
            itemHoverBg: '#e7ebef',
            itemSelectedBg: '#1b68fc14',
          },
          Table: {
            headerBg: '#F3F5FC',
          },
        },
      }}
    >
      <DocumentHead title={SiteInfo.name} />
      <Switch elseView={<ErrorPage />}>
        {!!error && <ErrorPage message={error} />}
        {isTracePage && <DueDiligenceMain />}
        {!isTracePage && subModule === 'admin' && <Admin />}
        {curView === 'login' && <LoginForm dispatch={dispatch} />}
      </Switch>
      <LoadingPanel loadingState={globalLoading} />
    </ConfigProvider>
  );
};

export default connectStore(mapStateToProps)(Component);
