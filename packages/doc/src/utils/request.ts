import {ActionError} from '@elux/react-web';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {ApiPrefix} from '@/Global';
import {Message, getToken, toLoginPage} from './tools';

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
  ///dream/pen/ai/writer/test
  return url.replace(/^\/(dream|ai)\//, (pre) => ApiPrefix[pre]);
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

instance.interceptors.request.use((req) => {
  const {token} = getToken();
  if (token) {
    req.headers['Authorization'] = `Bearer ${token}`;
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
      const errorData = data.message || `failed to call ${requestUrl}`;
      const errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
      if (!requestHeaders.quiet) {
        Message.error(errorMessage);
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
      toLoginPage();
      throw new CustomError(mapHttpErrorCode(httpErrorCode), '请登录！');
    }
    const config = error.config!;
    const requestHeaders = config.headers;
    const requestUrl = config.url;
    const errorData = data.message || `failed to call ${requestUrl}`;
    const errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
    if (!requestHeaders.quiet) {
      Message.error(errorMessage);
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
      authorization: `bearer ${getToken()}`,
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
          Message.error(`${res.msg}.`);
          callback.onError(file, res);
        }
      } else if (file.status === 'error') {
        Message.error(`${file.name} file upload failed.`);
        callback.onError(file, res);
      }
    },
  };
}
