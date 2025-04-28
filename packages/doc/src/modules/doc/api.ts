import dayjs from 'dayjs';
import request from '@/utils/request';
import {mapTree} from '@/utils/tools';
import {ItemDetail, ListItem, ListResult, ListSearch} from './entity';

export const DocAPI = {
  createDoc({title, contents, folder}: {title: string; contents: string; folder: string}): Promise<{id: string}> {
    contents = contents || '<p style="line-height: 1.5;"><span style="font-size: 16px; font-family: 黑体;"></span></p>';
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
  batchDelete(items: {id: string; type: 'dir' | 'doc'}[]): Promise<void> {
    return request.post(
      `/dream/pen/dFolder/batch/delete`,
      items.map((item) => ({id: item.id, type: item.type === 'dir' ? 1 : 2}))
    );
  },
  deleteItem(id: string, type: 'dir' | 'doc'): Promise<void> {
    return type === 'doc' ? request.post(`/dream/pen/article/delete/${id}`) : request.post(`/dream/pen/dFolder/delete`, {id});
  },
  copyItem(id: string, type: 'dir' | 'doc'): Promise<void> {
    return request.post(type === 'doc' ? `/dream/pen/article/copy` : '', {id});
  },
  moveItem(id: string, type: 'dir' | 'doc', targetFolder: string): Promise<void> {
    return request.post('/dream/pen/dFolder/move', {original: id, targetFolder, type: type === 'dir' ? 1 : 2});
  },
  collectItem(id: string, type: 'dir' | 'doc', checked: boolean): Promise<void> {
    return request.post(type === 'doc' ? `/dream/pen/article/collect` : '', {id, type: checked});
  },
  getDoc({id}: {id: string}): Promise<ItemDetail> {
    return request.get(`/dream/pen/article/get`, {params: {id}}).then((docRes) => {
      const item: ItemDetail = docRes.data.data;
      return item;
    });
  },
  getList(search: ListSearch): Promise<ListResult> {
    const {id = '0', render, name, sorterOrder, sorterField} = search;
    return Promise.all([
      render === 'favs'
        ? request.get(`/dream/pen/article/collectList`, {
            params: {title: name, order: sorterOrder === 'ascend' ? 'asc' : undefined, page: 1, pageSize: 99999},
          })
        : request.get(`/dream/pen/dFolder/list`, {params: {id, name, order: sorterOrder === 'ascend' ? 'asc' : undefined}}),
      request.get(`/dream/pen/dFolder/level`, {params: {id}}),
      request.get(`/dream/pen/dFolder/tree`),
    ]).then(([listRes, levelRes, dirTreeRes]) => {
      const list: ListItem[] = (render === 'favs' ? listRes.data.data.data : listRes.data.data) || [];
      const dirTree = dirTreeRes.data.data || [];
      return {
        list: list.map((item) => {
          item.type = item.articleId || render === 'favs' ? 'doc' : 'dir';
          item.id = item.articleId || item.folderId || item.id;
          item.title = item.title || item.folderName;
          item.updateDate = item.updateDate ? dayjs(item.updateDate).format('YYYY-MM-DD HH:mm:ss') : '';
          item.createUserName = item.createUserName || '';
          item.collect = render === 'favs' ? 1 : item.collect;
          return item;
        }),
        summary: {
          pageCurrent: 1,
          pageSize: 999999,
          totalItems: list.length,
          levelPath: levelRes.data.data || [],
          dirTree: [{title: '我的文档', key: '0', children: mapTree<any, any>(dirTree, (item) => ({title: item.name, key: item.id}))}],
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
