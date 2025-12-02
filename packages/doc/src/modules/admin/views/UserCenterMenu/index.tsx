import {useEffect, useRef} from 'react';
import {SitesUrl} from '@/Global';
import {replaceBaseUrl} from '@/utils/request';
import {getTenant, getToken, info} from '@/utils/tools';

const UserMenu: React.FC<{username: string; logout: () => void; switchTenant: () => void}> = ({username, logout, switchTenant}) => {
  const userMenuRef: any = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = userMenuRef.current;
    if (!el) return;

    const errorCallback = (data: CustomEvent) => {
      const res = data.detail[0];
      if (res.status === 402) {
        info(res.data.message || '检测到租户已发生变化，需要刷新数据...', () => {
          switchTenant();
        });
      }
    };
    //通过原生自定义事件方式订阅事件
    userMenuRef.current.addEventListener('logout', logout);
    userMenuRef.current.addEventListener('switch-tenant', switchTenant);
    userMenuRef.current.addEventListener('request-error', errorCallback);

    return () => {
      userMenuRef.current.removeEventListener('logout', logout);
      userMenuRef.current.removeEventListener('switch-tenant', switchTenant);
      userMenuRef.current.removeEventListener('request-error', errorCallback);
    };
  }, [logout]);

  return (
    <user-menu
      ref={userMenuRef}
      token={getToken()}
      user-name={username}
      tenant-id={getTenant()}
      cloud-url={SitesUrl.user} //对应用户中心接口请求地址url
      base-url={replaceBaseUrl('/dream/pen/sso')} //对应用户中心接口请求地址url
    />
  );
};

export default UserMenu;
