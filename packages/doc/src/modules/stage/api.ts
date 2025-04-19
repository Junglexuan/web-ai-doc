import JSEncrypt from 'jsencrypt';
import {PublicKey} from '@/Global';
import {CurUser} from '@/utils/base';
import request from '@/utils/request';
import {LoginParams} from './entity';

export const guest: CurUser = {
  id: '',
  username: '游客',
  hasLogin: false,
  agencyID: 1,
  userType: 1,
};

export const admin: CurUser = {
  id: 'aaaa',
  username: '游客',
  hasLogin: true,
  agencyID: 6,
  userType: 1,
};

class API {
  public getCurUser(ticket?: string, redirect?: string): Promise<CurUser> {
    if (ticket) {
      return request.post(`/dream/pen/sso/login?ticket=${ticket}`).then(
        (res) => {
          const {token, ...user} = res.data.data;
          localStorage.setItem('zov-user-token', token);
          localStorage.setItem('zov-user-info', JSON.stringify(user));
          setTimeout(() => {
            window.location.href = redirect || '/';
          });
          return {...user, hasLogin: true};
        },
        () => guest
      );
    } else {
      return request.get('/dream/pen/currentUser', {headers: {quiet: 1}}).then(
        (res) => {
          return {...res.data.data, hasLogin: true};
        },
        () => {
          return guest;
        }
      );
    }
  }
  public logout(): Promise<CurUser> {
    return request.post(`/dream/pen/sso/signout`).then(() => {
      localStorage.removeItem('zov-user-token');
      localStorage.removeItem('zov-user-info');
      return guest;
    });
  }

  public login(params: LoginParams): Promise<CurUser> {
    const {password, username} = params;
    let passwordEncryption = '';
    if (password) {
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(PublicKey);
      passwordEncryption = encrypt.encrypt(password) || '';
    }
    if (!passwordEncryption) {
      throw '密码错误';
    }
    return request.post('/user/usercenter/platform/agency/auth/login', {userName: username, passwordEncryption}).then((res) => {
      const {token, ...user} = res.data.data;
      const {agencyID, platformUserID, userType} = user;
      localStorage.setItem('zov-user-token', token);
      localStorage.setItem('zov-user-info', JSON.stringify(user));
      return {id: platformUserID, username, agencyID, userType, hasLogin: true};
    });
  }
}

export default new API();
