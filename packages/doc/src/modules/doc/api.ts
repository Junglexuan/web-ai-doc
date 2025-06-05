import {setLoading as setGlobalLoading} from '@elux/react-web';
import dayjs from 'dayjs';
import {GetClientRouter} from '@/Global';
import request from '@/utils/request';
import {mapTree} from '@/utils/tools';
import {CurRender, ItemDetail, ListItem, ListResult, ListSearch} from './entity';

export const DocAPI = {
  createDoc(data: string | {title: string; contents: string; folder: string}): Promise<{id: string}> {
    if (typeof data === 'string') {
      return setGlobalLoading(
        request.get('/dream/pen/template/get', {params: {id: data}}).then((res) => {
          const item: ItemDetail = res.data.data || {};
          return request
            .post(`/dream/pen/template/createArticle`, {
              id: data,
              content: (item.contents || '')
                .replace(/(<cite data-w-e-type="variable" .+? data-source=")(.+?)(">[^$]*)\$([^$]*<\/cite>)/g, '$1$2$3$2$4')
                .replace(/(<cite data-w-e-type="variable" [^>]+?)><span( [\w\W]+)<\/span>(<\/cite>)/g, '$1$2$3'),
            })
            .then((res) => res.data.data);
        }),
        GetClientRouter().getActivePage().store
      );
    } else {
      const {title, folder} = data;
      const contents = data.contents || '<p style="line-height: 1.5;"><span style="font-size: 16px; font-family: 黑体;"></span></p>';
      return request
        .post(`/dream/pen/article/save`, {
          title: title || '新建文档',
          articleDsl: '',
          contents,
          folder,
        })
        .then((res) => res.data.data);
    }
  },
  createDir({folder}: {folder: string}): Promise<{id: string}> {
    return request.post(`/dream/pen/dFolder/save`, {folderName: `新建文件夹`, parent: folder}).then((res) => res.data.data);
  },
  saveTpl(data: {id: string; title: string; remark: string; isShare: boolean}): Promise<{id: string}> {
    return request
      .post(`/dream/pen/template/save`, {
        id: data.id || undefined,
        title: data.title,
        contents: '<p style="line-height: 1.5;"><span style="font-size: 16px; font-family: 黑体;"></span></p>',
        remark: data.remark,
        isShare: data.isShare,
      })
      .then((res) => res.data.data);
  },
  deleteTpl(id: string): Promise<void> {
    return request.post(`/dream/pen/template/delete/${id}`);
  },
  saveDSL(id: string, dsl: string, html: string, text: string, isTpl?: boolean): Promise<void> {
    return request.post(isTpl ? '/dream/pen/template/save' : `/dream/pen/article/save`, {
      id,
      contents: html,
      articleDsl: dsl,
      articleCount: text.length,
    });
  },
  updateDocName(id: string, title: string, isTpl?: boolean): Promise<void> {
    return request.post(isTpl ? '/dream/pen/template/save' : `/dream/pen/article/save`, {id, title});
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
  cleanRecycle(): Promise<void> {
    return request.post(`/dream/pen/recycle/clean`);
  },
  cleanItem(id: string, type: 'dir' | 'doc'): Promise<void> {
    return request.post(`/dream/pen/recycle/delete/${id}`);
  },
  restoreItem(id: string, type: 'dir' | 'doc'): Promise<void> {
    return request.post(`/dream/pen/recycle/restore`, {id, type: type === 'dir' ? 1 : 2});
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
  collectItem(id: string, type: 'dir' | 'doc' | 'tpl', checked: boolean): Promise<void> {
    return request.post(type !== 'dir' ? `/dream/pen/article/collect` : '', {id, type: type === 'doc' ? 2 : 3, isCollect: checked});
  },
  getDoc({id, render}: {id: string; render?: CurRender}): Promise<ItemDetail> {
    const isTpl = render === 'tpl';
    return request.get(isTpl ? '/dream/pen/template/get' : '/dream/pen/article/get', {params: {id}}).then((docRes) => {
      const item: ItemDetail = docRes.data.data;
      item.isTpl = isTpl;
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
        : render === 'recs'
        ? request.get(`/dream/pen/recycle/list`, {
            params: {title: name, order: sorterOrder === 'ascend' ? 'asc' : undefined, page: 1, pageSize: 99999},
          })
        : render === 'tpls'
        ? request.get(`/dream/pen/template/list`, {
            params: {title: name, order: sorterOrder === 'ascend' ? 'asc' : undefined, page: 1, pageSize: 99999},
          })
        : request.get(`/dream/pen/dFolder/list`, {params: {id, name, order: sorterOrder === 'ascend' ? 'asc' : undefined}}),
      render === 'maintain' ? request.get(`/dream/pen/dFolder/level`, {params: {id}}) : ({} as any),
      render === 'maintain' ? request.get(`/dream/pen/dFolder/tree`) : ({} as any),
    ]).then(([listRes, levelRes, dirTreeRes]) => {
      const list: ListItem[] = listRes.data.data || [];
      const dirTree = dirTreeRes.data?.data || [];
      return {
        list: list.map((item) => {
          item.type = item.articleId || render === 'favs' || render === 'tpls' ? 'doc' : 'dir';
          item.id = item.articleId || item.folderId || item.articleTemplateId || item.id;
          item.title = item.title || item.folderName || (item as any).name;
          item.updateDate = item.updateDate ? dayjs(item.updateDate).format('YYYY-MM-DD HH:mm:ss') : '';
          item.createDate = item.createDate ? dayjs(item.createDate).format('YYYY-MM-DD HH:mm:ss') : '';
          item.createUserName = item.createUserName || '';
          item.collect = render === 'favs' ? 1 : item.collect;
          return item;
        }),
        summary: {
          pageCurrent: 1,
          pageSize: 999999,
          totalItems: list.length,
          levelPath: levelRes.data?.data || [],
          dirTree: [{title: '我的文档', key: '0', children: mapTree<any, any>(dirTree, (item) => ({title: item.name, key: item.id}))}],
        },
      };
    });
  },
};

export default DocAPI;
