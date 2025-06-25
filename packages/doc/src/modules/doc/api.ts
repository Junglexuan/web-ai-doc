import {setLoading as setGlobalLoading} from '@elux/react-web';
import dayjs from 'dayjs';
import {GetClientRouter} from '@/Global';
import request from '@/utils/request';
import {mapTree} from '@/utils/tools';
import {CurRender, DocType, ItemDetail, ListItem, ListResult, ListSearch, TplFields, TplsOptions} from './entity';

const TypeMap: {[key: string]: DocType} = {
  '1': 'dir',
  '2': 'doc',
  '3': 'tpl',
};

export const DocAPI = {
  createDoc(data: {title: string; contents: string; folder: string}): Promise<{id: string}> {
    const {title, folder} = data;
    const contents = data.contents || '<p style="line-height: 1.5;"><span style="font-size: 16px; font-family: 黑体;"></span></p>';
    return setGlobalLoading(
      request
        .post(`/dream/pen/article/save`, {
          title: title || '新建文档',
          articleDsl: '',
          contents,
          folder,
        })
        .then((res) => res.data.data),
      GetClientRouter().getActivePage().store
    );
    // if (typeof data === 'string') {
    //   return setGlobalLoading(
    //     request.get('/dream/pen/template/get', {params: {id: data}}).then((res) => {
    //       const item: ItemDetail = res.data.data || {};
    //       return request
    //         .post(`/dream/pen/template/createArticle`, {
    //           id: data,
    //           //fields: fields && Object.keys(fields).map((name) => ({key: name, value: fields[name]})),
    //           content: (item.contents || '')
    //             .replace(/(<cite data-w-e-type="variable" .+? data-source=")(.+?)(">[^$]*)\$[^<]*(<.*?\/cite>)/g, '$1$2$3$2$4')
    //             .replace(/(<cite data-w-e-type="variable" [^>]+?)><span( [\w\W]+?)<\/span>.*?(<\/cite>)/g, '$1$2$3'),
    //         })
    //         .then((res) => res.data.data);
    //     }),
    //     GetClientRouter().getActivePage().store
    //   );
    // } else {

    // }
  },
  createDir({folder}: {folder: string}): Promise<{id: string}> {
    return request.post(`/dream/pen/dFolder/save`, {folderName: `新建文件夹`, parent: folder}).then((res) => res.data.data);
  },
  saveTpl(data: {id: string; title: string; remark: string; isShare: boolean}): Promise<{id: string}> {
    return request
      .post(`/dream/pen/template/save`, {
        id: data.id || undefined,
        title: data.title,
        contents: data.id ? undefined : '<p style="line-height: 1.5;"><span style="font-size: 16px; font-family: 黑体;"></span></p>',
        remark: data.remark,
        isShare: data.isShare,
      })
      .then((res) => res.data.data);
  },
  deleteTpl(id: string): Promise<void> {
    return request.post(`/dream/pen/template/delete/${id}`);
  },
  saveDSL(id: string, dsl: string, html: string, text: string, isTpl?: boolean): Promise<void> {
    return request.post(isTpl ? '/dream/pen/template/save' : `/dream/pen/article/save1`, {
      id,
      contents: html,
      articleDsl: dsl,
      articleCount: text.length,
    });
  },
  updateDocName(id: string, title: string, isTpl?: boolean): Promise<void> {
    return request.post(isTpl ? '/dream/pen/template/save' : `/dream/pen/article/save`, {id, title});
  },
  updateDocSize(id: string, size: string, isTpl?: boolean): Promise<void> {
    return request.post(isTpl ? '/dream/pen/template/save' : `/dream/pen/article/save`, {id, size});
  },
  updateDirName(id: string, folderName: string): Promise<void> {
    return request.post(`/dream/pen/dFolder/save`, {id, folderName});
  },
  batchDelete(items: {id: string; type: DocType}[]): Promise<void> {
    return request.post(
      `/dream/pen/dFolder/batch/delete`,
      items.map((item) => ({id: item.id, type: item.type === 'dir' ? 1 : 2}))
    );
  },
  cleanRecycle(): Promise<void> {
    return request.post(`/dream/pen/recycle/clean`);
  },
  cleanItem(id: string, type: DocType): Promise<void> {
    return request.post(`/dream/pen/recycle/delete/${id}`);
  },
  restoreItem(id: string, type: DocType): Promise<void> {
    return request.post(`/dream/pen/recycle/restore`, {id, type: type === 'dir' ? 1 : 2});
  },
  deleteItem(id: string, type: DocType): Promise<void> {
    return type === 'doc' ? request.post(`/dream/pen/article/delete/${id}`) : request.post(`/dream/pen/dFolder/delete`, {id});
  },
  copyItem(id: string, type: DocType): Promise<void> {
    return request.post(type === 'doc' ? `/dream/pen/article/copy` : '', {id});
  },
  moveItem(id: string, type: DocType, targetFolder: string): Promise<void> {
    return request.post('/dream/pen/dFolder/move', {original: id, targetFolder, type: type === 'dir' ? 1 : 2});
  },
  collectItem(id: string, type: DocType, checked: boolean): Promise<void> {
    return request.post(type !== 'dir' ? `/dream/pen/article/collect` : '', {id, type: type === 'doc' ? 2 : 3, isCollect: checked});
  },
  getDoc({id, render}: {id: string; render?: CurRender}): Promise<ItemDetail> {
    const isTpl = render === 'tpl';
    return request.get('/dream/pen/article/get', {params: {id, type: isTpl ? '3' : '2'}}).then((docRes) => {
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
            params: {name, order: sorterOrder === 'ascend' ? 'asc' : undefined, page: 1, pageSize: 99999},
          })
        : request.get(`/dream/pen/dFolder/list`, {params: {id, name, order: sorterOrder === 'ascend' ? 'asc' : undefined}}),
      render === 'maintain' ? request.get(`/dream/pen/dFolder/level`, {params: {id}}) : ({} as any),
      render === 'maintain' ? request.get(`/dream/pen/dFolder/tree`) : ({} as any),
    ]).then(([listRes, levelRes, dirTreeRes]) => {
      const list: ListItem[] = listRes.data.data || [];
      const dirTree = dirTreeRes.data?.data || [];
      return {
        list: list.map((item) => {
          item.type = TypeMap[item.type];
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
  getTplsOptions(): Promise<TplsOptions> {
    return request.get('/dream/pen/template/getTemplateType').then((docRes) => {
      const list: any[] = docRes.data.data || [];
      return list.map((item) => ({
        value: item.id,
        label: item.title,
        children: (item.children || []).map((item2: any) => ({value: item2.templateId, label: item2.title})),
      }));
    });
  },
  getTplFields(id: string): Promise<TplFields[]> {
    return request.get('/dream/pen/template/getTemplateByType/' + id).then((docRes) => {
      const list: any[] = docRes.data.data.pluginVo || [];
      return list.map((item) => ({
        name: item.field,
        value: item.argument.desc || item.argument,
        label: item.field,
      }));
    });
  },
};

export default DocAPI;
