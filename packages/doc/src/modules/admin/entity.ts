export enum SubModule {
  'home' = 'home',
  'dueDiligence' = 'dueDiligence',
  'doc' = 'doc',
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  match?: string | string[];
  link?: string;
  children?: MenuItem[];
  disable?: boolean;
}

export interface MenuData {
  items: MenuItem[];
  keyToParents: {[key: string]: string[]};
  keyToLink: {[key: string]: string};
  matchToKey: {[match: string]: string};
}
