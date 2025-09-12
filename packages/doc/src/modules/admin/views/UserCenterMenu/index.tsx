import {useEffect, useRef} from 'react';
import {SitesUrl} from '@/Global';
import {getToken} from '@/utils/tools';

const UserMenu: React.FC<{username: string; logout: () => void; switchTenant: () => void}> = ({username, logout, switchTenant}) => {
  const userMenuRef: any = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = userMenuRef.current;
    if (!el) return;
    //通过原生自定义事件方式订阅事件
    userMenuRef.current.addEventListener('logout', logout);
    userMenuRef.current.addEventListener('switch-tenant', switchTenant);

    return () => {
      userMenuRef.current.removeEventListener('logout', logout);
      userMenuRef.current.removeEventListener('switch-tenant', switchTenant);
    };
  }, [logout]);

  return (
    <user-menu
      ref={userMenuRef}
      token={getToken()}
      user-name={username}
      base-url={SitesUrl.user} //对应用户中心接口请求地址url
    />
  );
};

export default UserMenu;
