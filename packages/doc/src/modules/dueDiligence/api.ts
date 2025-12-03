import request from '@/utils/request';
import {DueConfigs, DueSettings, ItemDetail, ListItem, ListResult, ListSearch} from './entity';

export const DueDiligenceAPI = {
  getConfigs(): Promise<DueConfigs> {
    return request.post(`/api/user/queryUserProperties`).then((res) => {
      const data = res.data.data || {};
      return {
        autoCreateFinalSheets: data.autoCreateFinalSheets,
        roles: {
          selected: data.businessId,
          list: data.businessVos.map((item: any) => ({value: item.id, label: item.businessName})),
        },
        questions: {
          selected: data.questionId,
          tpls: data.templateInfoVos.map((item: any) => ({
            value: item.id,
            label: item.templateName,
            list: (item.questionList || []).map(({id, questionName}: any) => ({
              id,
              questionName,
            })),
          })),
        },
        template: {
          selected: {
            id: data.templateId,
            name: data.reportTemplateVos.find((item: any) => item.id === data.templateId).reportTemplateName,
          },
          list: data.reportTemplateVos.map((item: any) => ({
            id: item.id,
            title: item.reportTemplateName,
            remark: item.remark,
            isShare: '0',
            url: item.outTemplateUrl,
            createUserName: item.createUserName,
            createDate: item.createDate,
          })),
        },
      };
    });
  },
  getList(search: ListSearch): Promise<ListResult> {
    const {keyWord = '', status} = search;
    return request
      .post(`/api/deal/queryDealInstListByPage`, {
        dealInstTitle: keyWord,
        pageNo: 1,
        pageSize: 999999,
        status: status === 'end' ? ['4'] : ['1', '2', '3'],
      })
      .then((res) => {
        const list: any[] = res.data.data.records || [];
        return {
          list: list.map(
            (item) =>
              ({
                id: item.id,
                name: item.interviewCust,
                logo: item.logo,
                status: item.status,
                desc: item.interviewDealInstDesc || '',
                progress: Number(item.progress),
              } as any)
          ),
          summary: {
            pageCurrent: 1,
            pageSize: 999999,
            totalItems: list.length,
          },
        };
      });
  },
  getItem(id: string): Promise<ItemDetail> {
    return request.post(`/api/deal/dealInstDetail?id=${id}`, {}).then((res) => {
      const item = res.data.data;
      const {interviewCust, report, interviewInstList} = item;
      const questionInstList = interviewInstList[0].questionInstList;
      const recordFile = interviewInstList[0].recordFileInstVo;
      return {
        id: item.id,
        name: item.interviewCust,
        logo: item.logo,
        status: item.status,
        desc: item.interviewDealInstDesc || '',
        progress: Number(item.progress),
        report,
        // 准备资料
        resources: item.resources || [],
        interviewInstList: [
          questionInstList && {
            id: 'questionInstList',
            fileName: '问题清单',
            fileUrl: JSON.stringify(questionInstList),
            type: 'list',
          },
          recordFile && {
            id: recordFile.id,
            fileName: recordFile.recordFileName,
            fileUrl: recordFile.recordFileUrl,
            type: 'wav',
          },
        ].filter(Boolean),
      } as any;
    });
  },
  createItem(data: ListItem): Promise<void> {
    const {name, logo, autoCreateFinalSheets, pathList, questions, template} = data;
    return request.post('/api/deal/createOrUpdateDealInst', {
      target: name,
      logo,
      autoCreateFinalSheets,
      templateId: template.id,
      questionId: questions.tpl,
      pathList: pathList.map((item) => item.url),
      questionInfoList: questions.list,
    });
  },
  deleteItem(id: string): Promise<void> {
    return request.post(`/dream/pen/rag/contract/delete`, {id});
  },
  updateItem(id: string, data: ListItem): Promise<void> {
    return request.post('/dream/pen/rag/contract/update', {...data, id});
  },
  updateConfig(data: DueSettings): Promise<void> {
    const {role, autoCreateFinalSheets, questions, template} = data;
    return request.post('/api/user/updateUserProperties', {
      businessId: role,
      templateId: template.id,
      questionId: questions.tpl,
      questionInfoList: questions.list,
      autoCreateFinalSheets,
    });
  },
  removeResourceFile(id: string): Promise<void> {
    return request.post(`/api/deal/delete/${id}`);
  },
  appendResource(id: string, text: string): Promise<void> {
    return request.post(`/api/interview/appendResource`, {interviewDealInstId: id, appendText: text});
  },
  rebuildReport(id: string): Promise<void> {
    return request.post(`/api/interview/applyAppendInterviewReportSync`, {interviewDealInstId: id});
  },
  resetTemplate(id: string, templateId: string): Promise<void> {
    return request.post('/api/deal/createOrUpdateDealInst', {
      id,
      templateId,
    });
  },
  renameReport(id: string, fileId: string, fileName: string): Promise<void> {
    return request.post('/api/deal/rename', {
      id,
      fileId,
      fileName,
    });
  },
};

export default DueDiligenceAPI;
