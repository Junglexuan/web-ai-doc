import {setLoading as setGlobalLoading} from '@elux/react-web';
import dayjs from 'dayjs';
import {GetClientRouter} from '@/Global';
import request from '@/utils/request';
import {getCurUserId, getUrlParam, mapTree, message} from '@/utils/tools';
import {DocType, ItemDetail, ListItem, ListResult, ListSearch, TplFields, TplsOptions} from './entity';

const TypeMap: {[key: string]: DocType} = {
  '1': 'dir',
  '2': 'doc',
  '3': 'tpl',
  '4': 'con',
};
const TypeSourceMap: {[key in DocType]: string} = {
  dir: '1',
  doc: '2',
  tpl: '3',
  con: '4',
};

export const DocAPI = {
  saveSnapshot(tplId: string, snapshot: string): Promise<void> {
    return request.post(`/dream/pen/template/snapshot/save`, {
      id: tplId,
      snapshot,
    });
  },
  createSnapshot(data: {tplId: string; contents?: string}, type: DocType): Promise<{id: string}> {
    const contents = data.contents || '<p style="line-height: 1.5;"><span style="font-family: 黑体;"></span></p>';
    return setGlobalLoading(
      request
        .post(`/dream/pen/template/snapshot/save`, {
          id: data.tplId,
          snapshot: contents,
        })
        .then((res) => res.data.data),
      GetClientRouter().getActivePage().store
    );
  },
  createDoc(data: {title: string; contents: string; folder: string}, type: DocType, size?: number): Promise<{id: string}> {
    const {title, folder} = data;
    const contents = data.contents || '<p style="line-height: 1.5;"><span style="font-family: 黑体;"></span></p>';
    return setGlobalLoading(
      request
        .post(`/dream/pen/article/save`, {
          title: title || '新建文档',
          articleDsl: '',
          contents,
          folder,
          type: TypeSourceMap[type],
          articleCount: size || undefined,
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
  createDir({folder}: {folder: string}, docType: DocType): Promise<{id: string}> {
    return request
      .post(`/dream/pen/dFolder/save`, {folderName: `新建文件夹`, parent: folder, type: TypeSourceMap[docType]})
      .then((res) => res.data.data);
  },
  updataTplInfo(data: {id: string; title: string; remark: string; isShare: boolean}, docType: DocType): Promise<{id: string}> {
    return request
      .post(`/dream/pen/template/save`, {
        id: data.id || undefined,
        title: data.title,
        contents: data.id ? undefined : '<p style="line-height: 1.5;"><span font-family: 黑体;"></span></p>',
        remark: data.remark,
        isShare: data.isShare,
        type: TypeSourceMap[docType],
      })
      .then((res) => res.data.data);
  },
  saveDSL(id: string, dsl: string, html: string, text: string, docType: DocType): Promise<void> {
    return request.post(docType === 'tpl' ? '/dream/pen/template/save' : '/dream/pen/article/save', {
      id,
      contents: html,
      articleDsl: '',
      articleCount: text.length,
      type: TypeSourceMap[docType],
    });
  },
  updateDocName(id: string, title: string, docType: DocType): Promise<void> {
    return request.post(docType === 'tpl' ? '/dream/pen/template/save' : `/dream/pen/article/save`, {id, title, type: TypeSourceMap[docType]});
  },
  updateDocSize(id: string, size: string, docType: DocType): Promise<void> {
    return request.post(docType === 'tpl' ? '/dream/pen/template/save' : `/dream/pen/article/save`, {id, size, type: TypeSourceMap[docType]});
  },
  updateDirName(id: string, folderName: string, docType: DocType): Promise<void> {
    return request.post(`/dream/pen/dFolder/save`, {id, folderName, type: TypeSourceMap[docType]});
  },
  batchDelete(items: {id: string; type: DocType}[]): Promise<void> {
    return request.post(
      `/dream/pen/dFolder/batch/delete`,
      items.map((item) => ({id: item.id, type: TypeSourceMap[item.type]}))
    );
  },
  cleanRecycle(): Promise<void> {
    return request.post(`/dream/pen/recycle/clean`);
  },
  cleanItem(id: string, type: DocType): Promise<void> {
    return request.post(`/dream/pen/recycle/delete/${id}`);
  },
  restoreItem(id: string, type: DocType): Promise<void> {
    return request.post(`/dream/pen/recycle/restore`, {id, type: TypeSourceMap[type]});
  },
  deleteItem(id: string, type: DocType): Promise<void> {
    return type === 'doc' || type === 'con'
      ? request.post(`/dream/pen/article/delete/${id}`)
      : type === 'tpl'
      ? request.post(`/dream/pen/template/delete/${id}`)
      : request.post(`/dream/pen/dFolder/delete`, {id});
  },
  copyItem(id: string, docType: DocType): Promise<void> {
    return request.post(docType === 'doc' ? `/dream/pen/article/copy` : '', {id, type: TypeSourceMap[docType]});
  },
  moveItem(id: string, type: DocType, targetFolder: string): Promise<void> {
    return request.post('/dream/pen/dFolder/move', {original: id, targetFolder, type: type === 'dir' ? 1 : 2});
  },
  collectItem(id: string, type: DocType, checked: boolean): Promise<void> {
    return request.post(type !== 'dir' ? `/dream/pen/article/collect` : '', {id, type: type === 'doc' ? 2 : 3, isCollect: checked}).then(() => {
      if (checked) {
        message.success('已经添加收藏');
      } else {
        message.warning('已经取消收藏');
      }
    });
  },
  getDoc(id: string): Promise<ItemDetail> {
    return request.get('/dream/pen/article/get', {params: {id}}).then((docRes) => {
      const item: ItemDetail = docRes.data.data;
      item.docType = TypeMap[(item as any).type];
      item.levelPath = item.levelPath || [];
      return item;
    });
  },
  getTplPreview(id: string): Promise<{tplId: string; snapshot: string; isMine: boolean}> {
    return request.get('/dream/pen/article/get', {params: {id}}).then((docRes) => {
      const item: ItemDetail = docRes.data.data;
      const curUserId = getCurUserId();
      return {tplId: item.id, snapshot: item.snapshot, format: item.format, isMine: !item.isSystem && !!curUserId && item.createUser === curUserId};
    });
  },
  copyTplForMe(id: string): Promise<string> {
    return request.post('/dream/pen/template/copy', {id}).then((docRes) => {
      const item: ItemDetail = docRes.data.data;
      return item.id;
    });
  },
  getList(search: ListSearch): Promise<ListResult> {
    const curUserId = getCurUserId();
    const {render, name, type, owner, sorterOrder, sorterField} = search;
    const id = search.id || (render === 'conts' ? '1' : '0');
    const docOrCont = render === 'conts' ? '4' : '2';
    return Promise.all([
      render === 'favs'
        ? request.get(`/dream/pen/article/collectList`, {
            params: {title: name, order: sorterOrder === 'ascend' ? 'asc' : undefined, page: 1, pageSize: 99999},
          })
        : render === 'recs'
        ? request.get(`/dream/pen/recycle/list`, {
            params: {title: name, order: sorterOrder === 'ascend' ? 'asc' : undefined, page: 1, pageSize: 99999},
          })
        : render === 'tpls' || render === 'tpls_'
        ? request.get(`/dream/pen/template/list`, {
            params: {name, type, key: owner, order: sorterOrder === 'ascend' ? 'asc' : undefined, page: 1, pageSize: 99999},
          })
        : request.get(`/dream/pen/dFolder/list`, {params: {id, name, order: sorterOrder === 'ascend' ? 'asc' : undefined}}),
      render === 'maintain' || render === 'conts' ? request.get(`/dream/pen/dFolder/level`, {params: {id, type: docOrCont}}) : ({} as any),
      render === 'maintain' || render === 'conts' ? request.get(`/dream/pen/dFolder/tree`, {params: {type: docOrCont}}) : ({} as any),
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
          item.isMine = !item.isSystem && !!curUserId && item.createUser === curUserId;
          return item;
        }),
        summary: {
          pageCurrent: 1,
          pageSize: 999999,
          totalItems: list.length,
          levelPath: levelRes.data?.data || [],
          dirTree: [
            {
              title: render === 'conts' ? '我的合同' : '我的文档',
              key: render === 'conts' ? '1' : '0',
              children: mapTree<any, any>(dirTree, (item) => ({title: item.name, key: item.id})),
            },
          ],
        },
      };
    });
  },
  getTplsOptions(kind: 'conts' | 'docs' = 'docs'): Promise<TplsOptions> {
    if (kind === 'conts') {
      return request.get('/dream/pen/template/getTemplateType?type=4').then((docRes) => {
        const list: any[] = docRes.data.data || [];
        const conts = list.pop();
        return conts.children.map((item: any) => ({
          value: item.templateId,
          label: item.title,
          children: [
            {value: item.templateId + ',甲方', label: '甲方'},
            {value: item.templateId + ',乙方', label: '乙方'},
          ],
        }));
      });
    }
    return request.get('/dream/pen/template/getTemplateType?type=2').then((docRes) => {
      const list: any[] = docRes.data.data || [];
      return list.map((item) => ({
        value: item.id,
        label: item.title,
        children: (item.children || []).map((item2: any) => ({value: item2.templateId, label: item2.title})),
      }));
    });
  },
  getTplFields(id: string, kind: 'conts' | 'docs' = 'docs'): Promise<TplFields[]> {
    return setGlobalLoading(
      request.get('/dream/pen/template/getTemplateByType/' + id.split(',')[0]).then((docRes) => {
        const list: any[] = docRes.data.data.pluginVo || [];
        const reiterated: {[key: string]: boolean} = {};
        return list
          .map((item) => {
            if (reiterated[item.field]) {
              return undefined as any;
            }
            reiterated[item.field] = true;
            return {
              name: item.field,
              value: item.argument.default || item.argument.prompt || '',
              label: item.field,
              holdplace: item.argument.remark || '',
            };
          })
          .filter(Boolean);
      }),
      GetClientRouter().getActivePage().store
    );
  },
  contractReview(
    docId: string,
    ruleCate: number
  ): Promise<
    {
      clauseExcerpt: string;
      issueDescription: string;
      issueType: string;
      suggestion: string;
    }[]
  > {
    return request.post('/dream/pen/rag/contract/check', {docId, type: ruleCate}).then((res) => {
      return res.data?.data?.checks || [];
    });
  },
};

export default DocAPI;
