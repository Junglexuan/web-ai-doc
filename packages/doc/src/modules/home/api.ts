import request from '@/utils/request';
import {HotArticle, HotTemplate} from './entity';

export const HomeAPI = {
  getHotArticleList(size: number): Promise<HotArticle[]> {
    return request.get(`/dream/pen/article/hot?size=${size}`).then((res) => res.data.data);
  },
  getHotTemplateList(): Promise<HotTemplate[]> {
    return request.get(`/dream/pen/template/hot`).then((res) => res.data.data);
  },
};

export default HomeAPI;
