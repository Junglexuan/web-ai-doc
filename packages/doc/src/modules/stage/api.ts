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
  public getCurUser(): Promise<CurUser> {
    return Promise.resolve(admin);
    // return request
    //   .post<IGetCurUser['Response']>('/app/6/page/1963/get', {agencyID: 6})
    //   .then((res) => {
    //     return {
    //       id: '11',
    //       username: 'admin',
    //       hasLogin: true,
    //       avatar: '',
    //       mobile: '',
    //     };
    //   })
    //   .catch(() => {
    //     return {
    //       id: '11',
    //       username: 'admin',
    //       hasLogin: true,
    //       avatar: '',
    //       mobile: '',
    //     };
    //   });
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
