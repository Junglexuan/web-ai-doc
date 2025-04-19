export interface CurUser {
  id: string;
  username: string;
  agencyID: number;
  userType: number;
  hasLogin: boolean;
}

//export const LoginUrl = (from?: string): string => `/stage/login?__c=_dialog&from=${encodeURIComponent(from || '')}`;
export const AdminHomeUrl = `/admin/home`;
export const InIframe = window.parent !== window;
