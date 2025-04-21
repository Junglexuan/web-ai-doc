import dayjs from 'dayjs';
import request from '@/utils/request';
import {ItemDetail, ListItem, ListResult, ListSearch} from './entity';

export const DocAPI = {
  createDoc({title, contents, folder}: {title: string; contents: string; folder: string}): Promise<{id: string}> {
    contents = contents || '<p style="line-height: 1.5;"><span style="font-size: 16px; font-family: 微软雅黑;"></span></p>';
    return request
      .post(`/dream/pen/article/save`, {
        title: title || '新建文档',
        articleDsl: '',
        contents,
        folder,
      })
      .then((res) => res.data.data);
  },
  createDir({folder}: {folder: string}): Promise<{id: string}> {
    return request.post(`/dream/pen/dFolder/save`, {folderName: `新建文件夹`, parent: folder}).then((res) => res.data.data);
  },
  saveDSL(id: string, dsl: string, html: string): Promise<void> {
    return request.post(`/dream/pen/article/save`, {id, contents: html, articleDsl: dsl});
  },
  updateDocName(id: string, title: string): Promise<void> {
    return request.post(`/dream/pen/article/save`, {id, title});
  },
  updateDirName(id: string, folderName: string): Promise<void> {
    return request.post(`/dream/pen/dFolder/save`, {id, folderName});
  },
  deleteDoc(id: string): Promise<void> {
    return request.post(`/dream/pen/article/delete/${id}`);
  },
  deleteDir(id: string): Promise<void> {
    return Promise.resolve();
  },
  batchDelete(items: {id: string; type: 'dir' | 'doc'}[]): Promise<void> {
    return request.post(
      `/dream/pen/dFolder/batch/delete`,
      items.map((item) => ({id: item.id, type: item.type === 'dir' ? 1 : 2}))
    );
  },
  getDoc({id}: {id: string}): Promise<ItemDetail> {
    return request.get(`/dream/pen/article/get`, {params: {id}}).then((docRes) => {
      const item: ItemDetail = docRes.data.data;
      return item;
    });
  },
  getList(search: ListSearch): Promise<ListResult> {
    const {id = '0'} = search;
    return Promise.all([request.get(`/dream/pen/dFolder/list`, {params: {id}}), request.get(`/dream/pen/dFolder/level`, {params: {id}})]).then(
      ([listRes, levelRes]) => {
        const list: ListItem[] = listRes.data.data || [];
        return {
          list: list.map((item) => {
            item.type = item.articleId ? 'doc' : 'dir';
            item.id = item.articleId || item.folderId;
            item.title = item.title || item.folderName;
            item.updateDate = item.updateDate ? dayjs(item.updateDate).format('YYYY-MM-DD HH:mm:ss') : '';
            item.createUserName = item.createUserName || '';
            return item;
          }),
          summary: {
            pageCurrent: 1,
            pageSize: 999999,
            totalItems: list.length,
            levelPath: levelRes.data.data || [],
          },
        };
      }
    );
  },
  alterItems(id: string, changed: {title: string}): Promise<void> {
    return request.put(`/api/flow/${id}`, changed);
  },

  updateItem(id: string, dsl: string): Promise<void> {
    return request.put(`/api/flow/${id}`, {dsl});
  },
};

export default DocAPI;
