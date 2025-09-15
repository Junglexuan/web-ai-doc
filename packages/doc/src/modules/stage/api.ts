import {CurUser} from '@/utils/base';
import request from '@/utils/request';
import {clearToken} from '@/utils/tools';

export const guest: CurUser = {
  id: '',
  nickName: '游客',
  username: '游客',
  hasLogin: false,
};

class API {
  public getCurUser(ticket?: string, redirect?: string): Promise<CurUser> {
    if (ticket) {
      return request.post(`/dream/pen/sso/login?ticket=${ticket}`).then(
        (res) => {
          const {token, userId, nickName, username, tenantId} = res.data.data;
          const user: CurUser = {
            id: userId,
            username,
            nickName,
            hasLogin: true,
          };
          localStorage.setItem('zov-user-token', token);
          localStorage.setItem('zov-user-tenant', tenantId);
          localStorage.setItem('zov-user-info', JSON.stringify(user));
          setTimeout(() => {
            window.location.href = redirect || '/';
          });
          return user;
        },
        () => guest
      );
    } else {
      return request.get('/dream/pen/currentUser', {headers: {quiet: 1}}).then(
        (res) => {
          localStorage.setItem('zov-user-tenant', res.data.data.tenantId);
          return {...res.data.data, hasLogin: true};
        },
        (e) => {
          if (e.code === '402') {
            //402表示租户发生变化，终止执行跳往首页
            throw e;
          }
          return guest;
        }
      );
    }
  }
  public logout(): Promise<CurUser> {
    return request.post(`/dream/pen/sso/signout`).then(() => {
      clearToken();
      return guest;
    });
  }
}

export default new API();
