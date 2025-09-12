import {ActionError} from '@elux/react-web';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {ApiBaseUrl, ApiPrefix, PathPrefix, SitesUrl} from '@/Global';
import {clearToken, getToken, message, warning} from './tools';

function toErrorMessage(status: number) {
  switch (status) {
    case 400:
      return '请求错误:请求参数错误';
    case 401:
      return '登录失效';
    case 403:
      return '禁止访问:您没有权限访问改资源';
    case 404:
      return '未找到:请求的资源不存在';
    case 500:
      return '服务器错误:请稍后重试';
    case 502:
      return '服务器错误:请求超时';
    default:
      return '请求错误:发生未知错误';
  }
}
export interface IRequest<Req, Res> {
  Request: Req;
  Response: Res;
}

export enum ErrorCode {
  unauthorized = 'unauthorized',
  forbidden = 'forbidden',
  notFound = 'notFound',
  unkown = 'unkown',
}

export function replaceBaseUrl(url: string): string {
  url = url.replace(/^\/(dream|auth)\//, (pre) => ApiPrefix[pre] || pre);
  if (ApiBaseUrl && url.startsWith('/')) {
    url = ApiBaseUrl + url;
  }
  return url;
}

export function toUserCenter(): void {
  window.location.href = replaceBaseUrl('/auth/');
}

export class CustomError<Detail = any> implements ActionError {
  public constructor(public code: string, public message: string, public detail?: Detail, public quiet?: boolean) {}
}

function mapHttpErrorCode(httpCode: number): ErrorCode {
  const HttpErrorCode: any = {
    401: ErrorCode.unauthorized,
    403: ErrorCode.forbidden,
    404: ErrorCode.notFound,
  };
  return HttpErrorCode[httpCode] || ErrorCode.unkown;
}

function isMapObject(obj: any): Boolean {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function mergeDefaultParams<T extends {[key: string]: any}>(defaultParams: T, targetParams: {[key: string]: any}): T {
  return Object.keys(defaultParams).reduce((result: any, key) => {
    const defVal = defaultParams[key];
    const tgtVal = targetParams[key];
    if (tgtVal == undefined) {
      result[key] = defVal;
    } else if (isMapObject(defVal) && isMapObject(tgtVal)) {
      result[key] = mergeDefaultParams(defVal, tgtVal);
    } else {
      result[key] = tgtVal;
    }
    return result;
  }, {}) as any;
}

export function excludeDefaultParams(defaultParams: {[key: string]: any}, targetParams: {[key: string]: any}): {[key: string]: any} | undefined {
  const result: any = {};
  let hasSub = false;
  Object.keys(targetParams).forEach((key) => {
    let tgtVal = targetParams[key];
    const defVal = defaultParams[key];
    if (tgtVal !== defVal) {
      if (isMapObject(defVal) && isMapObject(tgtVal)) {
        tgtVal = excludeDefaultParams(defVal, tgtVal);
      }
      if (tgtVal !== undefined) {
        hasSub = true;
        result[key] = tgtVal;
      }
    }
  });
  return hasSub ? result : undefined;
}

const instance = axios.create({
  timeout: 60 * 1000 * 5,
  headers: {
    'Content-type': 'application/json;charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

//instance.defaults.withCredentials = true;

instance.interceptors.request.use((req) => {
  const token = getToken();
  if (token) {
    req.headers['Authorization'] = token;
  }
  req.url = replaceBaseUrl(req.url!);
  if (req.method === 'post') {
    if (!req.data) {
      req.data = {};
    }
    // if (!req.data.agencyID) {
    //   req.data.agencyID = parseInt(agencyID);
    // }
  }
  return req;
});

instance.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const data = response.data;
    if (!data.success) {
      const config = response.config!;
      const requestHeaders = config.headers;
      const requestUrl = config.url;
      const errorMessage = `请求错误${data.message ? '（' + data.message + '）' : ''}`;
      if (!requestHeaders.quiet) {
        message.error(errorMessage);
      }
      throw new CustomError(ErrorCode.unkown, '', data);
    }

    return response;
  },
  (error: AxiosError<{message: string}>) => {
    const response: any = error.response || {};
    const httpErrorCode = response.status || 0;
    const data: any = response.data || {};
    if (httpErrorCode === 401) {
      clearToken();
      toLoginPage();
      throw new CustomError(mapHttpErrorCode(httpErrorCode), '请登录！');
    } else if (httpErrorCode === 402) {
      warning('检测到租户已发生变化，需要刷新数据...', () => {
        window.location.href = SitesUrl.verse;
      });
      throw new CustomError('402', '');
    }
    const config = error.config!;
    const requestHeaders = config.headers;
    //const requestUrl = config.url;
    const errorMessage = `${toErrorMessage(httpErrorCode)}${data.message ? '(' + data.message + '）' : ''}`;
    if (httpErrorCode && !requestHeaders.quiet) {
      message.error(errorMessage);
    }
    throw new CustomError(mapHttpErrorCode(httpErrorCode), '', data);
  }
);

export default instance;

export function getUploadProps(
  url: string,
  callback: {onProcess: () => void; onSuccess: (file: any, res: any) => void; onError: (data: any, res: any) => void}
): {[key: string]: any} {
  return {
    name: 'file',
    action: replaceBaseUrl(url),
    headers: {
      authorization: getToken(),
    },
    onChange(info: any) {
      const file = info.file || {};
      const res = file.response;
      if (file.status === 'uploading') {
        callback.onProcess();
      }
      if (file.status === 'done') {
        if (res.success) {
          callback.onSuccess(file, res.data);
        } else {
          message.error(`${res.message}.`);
          callback.onError(file, res);
        }
      } else if (file.status === 'error') {
        message.error(`${file.name} file upload failed.`);
        callback.onError(file, res);
      }
    },
  };
}

export function toLoginPage(from?: string): void {
  window.location.href =
    replaceBaseUrl('/auth/login?client=global&redirecturl=') +
    window.location.origin +
    `/${PathPrefix || ''}/stage/login`.replace(/\/\//g, '/') +
    encodeURIComponent(`?__c=_dialog&from=${encodeURIComponent(from || window.location.href)}`);
  // if (!InIframe) {
  //   // const router = GetClientRouter();
  //   // const url = LoginUrl(from || router.location.url);
  //   // router.push({url}, 'window');
  //   window.location.href = replaceBaseUrl(
  //     '/login?client=global&redirecturl=http://192.168.1.66:8081/dream/pen/sso/login?back=http://192.168.1.66:8081/dream/pen'
  //   );
  // } else {
  //   window.parent.parent.location.href = `/zov-lowcode/login?callbackUrl=${encodeURIComponent(from || window.parent.parent.location.href)}`;
  // }
}

// a标签下载专用，
export function downloadFile(url: string, fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(); //定义http请求对象
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', getToken());
    xhr.send();
    xhr.responseType = 'blob';
    xhr.onload = function () {
      resolve();
      if (xhr.status === 200) {
        const blob = this.response;
        //const fileName = _fileName;
        //const disposition = xhr.getResponseHeader('Content-Disposition');
        // if (disposition && disposition.indexOf('attachment') !== -1) {
        //   const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        //   if (matches != null && matches[1]) {
        //     const filename = matches[1].replace(/['"]/g, '');
        //     console.log('File name:', filename);
        //   }
        // }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = function (e) {
          const a = document.createElement('a');
          a.download = fileName;
          a.href = e.target!.result as string;
          a.click();
        };
      } else {
        alert('下载文件出现了错误!');
      }
    };
  });
}
