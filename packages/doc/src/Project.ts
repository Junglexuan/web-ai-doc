import {AppConfig, setConfig} from '@elux/react-web';
import {parse, stringify} from 'query-string';
import {PathPrefix} from '@/Global';
import admin from '@/modules/admin';
import stage from '@/modules/stage';
import {AdminHomeUrl} from '@/utils/base';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const ModuleGetter = {
  stage: () => stage,
  admin: () => admin,
  doc: () => import('@/modules/doc'),
};

export const appConfig: AppConfig = setConfig({
  ModuleGetter,
  QueryString: {parse, stringify},
  NativePathnameMapping: {
    in(nativePathname) {
      nativePathname = nativePathname.replace(PathPrefix, '') || '/';
      if (nativePathname === '/') {
        nativePathname = AdminHomeUrl();
      }
      return nativePathname;
    },
    out(internalPathname) {
      return PathPrefix + internalPathname;
    },
  },
});

export type IModuleGetter = typeof ModuleGetter;
