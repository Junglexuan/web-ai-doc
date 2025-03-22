import dayjs from 'dayjs';
import request from '@/utils/request';
import {ItemDetail, ListItem, ListResult, ListSearch} from './entity';

export const DocAPI = {
  createDoc({contents, folder}: {contents: string; folder: string}): Promise<{id: string}> {
    return request
      .post(`/dream/dream/pen/article/save`, {title: `新建文档 ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, contents, folder})
      .then((res) => res.data.data);
  },
  createDir({folder}: {folder: string}): Promise<{id: string}> {
    return request
      .post(`/dream/dream/pen/dFolder/save`, {folderName: `新建文件夹 ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, parent: folder})
      .then((res) => res.data.data);
  },
  saveDSL(id: string, dsl: string): Promise<void> {
    return request.post(`/dream/dream/pen/article/save`, {id, contents: dsl});
  },
  updateDocName(id: string, title: string): Promise<void> {
    return request.post(`/dream/dream/pen/article/save`, {id, title});
  },
  getDoc({id}: {id: string}): Promise<ItemDetail> {
    return Promise.all([
      request.get(`/dream/dream/pen/article/get`, {params: {id}}),
      request.get(`/dream/dream/pen/dFolder/level`, {params: {id}}),
    ]).then(([docRes]) => {
      const item: ItemDetail = docRes.data.data;
      return item;
    });
  },
  getList(search: ListSearch): Promise<ListResult> {
    const {id = '0'} = search;
    return request.get(`/dream/dream/pen/dFolder/list`, {params: {id}}).then((res) => {
      const list: ListItem[] = res.data.data || [];
      return {
        list: list.map((item) => {
          item.type = item.articleId ? 'doc' : 'dir';
          item.id = item.articleId || item.folderId;
          item.title = item.title || item.folderName;
          return item;
        }),
        summary: {
          pageCurrent: 1,
          pageSize: 999999,
          totalItems: list.length,
        },
      };
    });
  },
  alterItems(id: string, changed: {title: string}): Promise<void> {
    return request.put(`/api/flow/${id}`, changed);
  },

  updateItem(id: string, dsl: string): Promise<void> {
    return request.put(`/api/flow/${id}`, {dsl});
  },
};

export default DocAPI;
