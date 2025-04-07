import '@wangeditor-next/editor/dist/css/style.css';
import '@/assets/css/global.module.less';
import '@/assets/css/editor.less';
import {Dispatch, DocumentHead, LoadingState, Switch, connectStore} from '@elux/react-web';
import {ConfigProvider, message} from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import {FC, useEffect} from 'react';
import ErrorPage from '@/components/ErrorPage';
import LoadingPanel from '@/components/LoadingPanel';
import {APPState, LoadComponent} from '@/Global';
import {globalDispatcher} from '@/utils/tools';
import {CurView, SubModule} from '../entity';
import LoginForm from './LoginForm';

const Admin = LoadComponent('admin', 'main');

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
  useEffect(() => {
    return globalDispatcher.addListener('message', (data) => {
      const {type, text} = data;
      if (type === 'error') {
        message.error(text);
      } else {
        message.success(text);
      }
    });
  }, []);
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
      <DocumentHead title="梦笔公文" />
      <Switch elseView={<ErrorPage />}>
        {!!error && <ErrorPage message={error} />}
        {subModule === 'admin' && <Admin />}
        {curView === 'login' && <LoginForm dispatch={dispatch} />}
      </Switch>
      <LoadingPanel loadingState={globalLoading} />
    </ConfigProvider>
  );
};

export default connectStore(mapStateToProps)(Component);
