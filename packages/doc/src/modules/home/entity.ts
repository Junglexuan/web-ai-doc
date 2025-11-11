export interface HotArticle {
  articleCount: number; //文章字数
  articleLength: number; //文章篇幅
  articleSize: string; //文章大小
  createDate: string; //创建时间
  id: string;
  title: string; //标题
  updateDate: string; //更新时间
  levelPath: string; //文章路径
}
export interface HotTemplate {
  id: string;
  title: string; //模板名称
  remark: string; //备注
  contents: string;
  snapshot: string;
  isShare: boolean;
  isSystem: boolean;
  isHot: boolean;
  isContract: boolean;
  isMine: boolean;
}
