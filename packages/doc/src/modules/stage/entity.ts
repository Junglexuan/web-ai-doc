export enum SubModule {
  'admin' = 'admin',
}

export enum CurView {
  'login' = 'login',
}

export interface LoginParams {
  username: string;
  password: string;
  keep: boolean;
}
