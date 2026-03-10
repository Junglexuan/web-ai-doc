import {BaseCurRender, BaseCurView, BaseListItem, BaseListSearch, BaseListSummary} from '@/utils/resource';

export type CurView = BaseCurView;
export type CurRender = BaseCurRender;

export interface ListSearch extends BaseListSearch {
  keyWord?: string;
  status?: 'start' | 'end';
}
export interface ListItem extends BaseListItem {
  name: string;
  logo: string;
  desc: string;
  progress: number;
  pathList: {uid: string; name: string; status: string; url: string; thumbUrl: string}[];
  autoCreateFinalSheets: boolean;
  questions: {
    tpl: string;
    list: {id: string; questionName: string}[];
  };
  template: {
    id: string;
    name: string;
  };
  status: string;
  dealSummary?: string;
}
export interface ListSummary extends BaseListSummary {}

export interface ListResult {
  list: ListItem[];
  summary: ListSummary;
}

export interface ItemDetail {
  id: string;
  name: string;
  logo: string;
  desc: string;
  status: string;
  progress: number;
  dealSummary?: string;
  updateDate?: string;
  // 报告
  report: {
    id: string;
    fileName: string;
    fileUrl: string;
    wordCount: number;
    updateTime: string;
    type: string;
    lastModifiedTime: string;
    matchNum: number;
    relationId: string;
    total: number;
    owner: string;
  };
  calculation: {
    id: string;
    fileName: string;
    fileUrl: string;
    type: string;
  };
  // 准备资料
  resources: {
    id: string;
    fileName: string;
    fileUrl: string;
    type: string;
    lastModifiedTime: string;
  }[];
  // 补充资料
  supplementary: {
    id: string;
    fileName: string;
    fileUrl: string;
    type: string;
    lastModifiedTime: string;
  }[];
  // 访谈资料
  interviewInstList: {
    id: string;
    fileName: string;
    fileUrl: string;
    type: string;
    lastModifiedTime: string;
  }[];
}

/**
 * 模板信息（后端返回的实际数据结构）- 用于 /reportApprove 接口
 */
export interface TemplateRecord {
  id: string;
  agencyId: number;
  centerUserId: number;
  approveReportName: string; // 模板名称
  approveReportStatus: string; // "1"-审批通过，"2"-审批中，"3"-审批未通过
  approveTemplateUrl: string; // 模板文件URL
  viewTemplateUrl?: string; // 预览URL
  createDate: string; // 创建时间
  createUser: number;
  lastModifiedDate: string; // 最后修改时间
  lastModifiedUser: number;
  errorMsg: string | null; // 错误信息
  recStatus: string | null;
}

/**
 * 报告模板信息 - 用于 /template 接口
 */
export interface ReportTemplate {
  id: string;
  businessId: string;
  centerUserId: string | null;
  dealInstId: string | null;
  dealInstTitle: string | null;
  outTemplateId: string;
  outTemplateUrl: string; // 导出/文件URL
  viewTemplateUrl: string; // 模板预览URL
  questionId: number;
  recStatus: string;
  reportTemplateName: string; // 模板名称
  reportTemplateStatus: string; // 模板状态
}

export type EditItem = ListItem;

export const defaultListSearch: ListSearch = {
  pageCurrent: 1,
  pageSize: 99999,
  sorterOrder: undefined,
  sorterField: undefined,
  keyWord: undefined,
};

export type TPL = {
  id: string;
  title: string;
  remark: string;
  url: string;
  isShare: string;
  createUserName: string;
  createDate: string;
};

export type DueConfigs = {
  autoCreateFinalSheets: boolean;
  roles: {
    selected: string;
    list: {value: string; name: string}[];
  };
  questions: {
    selected: string;
    tpls: {
      value: string;
      label: string;
      list: {id: string; questionName: string}[];
    }[];
  };
  template: {
    selected: {
      id: string;
      name: string;
    };
    list: TPL[];
  };
};
export interface DueSettings {
  role: string;
  autoCreateFinalSheets: boolean;
  questions: {
    tpl: string;
    list: {id: string; questionName: string}[];
  };
  template: {
    id: string;
    name: string;
  };
}

export const StatusMap: {[key: string]: string} = {
  '1': '准备中',
  '2': '访谈中',
  '3': '完善中',
  '4': '已结束',
};

export type DocType = 'dir' | 'doc' | 'tpl' | 'con';
export interface ItemDetail {
  id: string;
  title: string;
  contents: string;
  articleDsl: string;
  snapshot: string;
  collect: number;
  folder: string;
  createUser: string;
  createUserName: string;
  createDate: string;
  articleCount: number;
  size: '常规' | '全宽' | '超宽';
  levelPath: {id: string; folderName: string; parent: string}[];
  docType: DocType;
  format?: string;
  isShare?: boolean;
  isSystem?: boolean;
  isMine?: boolean;
  readonly?: boolean;
  wordPlugin?: {type: string; title: string; remark: string; attribute: string; id: string}[];
}
