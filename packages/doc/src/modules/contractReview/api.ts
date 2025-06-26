import request from '@/utils/request';
import {ListItem, ListResult, ListSearch} from './entity';

export const ContractReviewAPI = {
  getList(search: ListSearch): Promise<ListResult> {
    const {keyWord = '', type} = search;
    return request
      .post(`/dream/pen/rag/contract/list`, {
        keyWord,
        pageNo: 1,
        pageSize: 999999,
        types: type ? [type] : [1],
      })
      .then((res) => {
        const list: any[] = res.data.data;
        return {
          list: list,
          summary: {
            pageCurrent: 1,
            pageSize: 999999,
            totalItems: list.length,
          },
        };
      });
  },
  getCateList(): Promise<{label: string; value: number}[]> {
    return request.get(`/dream/pen/rag/contract/typeList`).then((res) => {
      const list: any[] = res.data.data || [];
      return list.map((item) => ({label: item.name, value: item.id}));
    });
  },
  deleteItem(id: string): Promise<void> {
    return request.post(`/dream/pen/rag/contract/delete`, {id});
  },
  createItem(data: ListItem): Promise<void> {
    return request.post('/dream/pen/rag/contract/create', data);
  },
  updateItem(id: string, data: ListItem): Promise<void> {
    return request.post('/dream/pen/rag/contract/update', {...data, id});
  },
};

export default ContractReviewAPI;
