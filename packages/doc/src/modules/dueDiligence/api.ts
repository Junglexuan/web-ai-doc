import request from '@/utils/request';
import {getCurUserId} from '@/utils/tools';
import {DueConfigs, DueSettings, ItemDetail, ListItem, ListResult, ListSearch} from './entity';

/** 与移动端对齐：尽调管理、创建尽调、上传资料、生成/重新生成报告、报告详情、资料管理 */

export const DueDiligenceAPI = {
  getConfigs(): Promise<DueConfigs> {
    return request.get(`/api/user/queryUserProperties`).then((res) => {
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
            name: data.reportTemplateVos.find((item: any) => item.id === data.templateId)?.reportTemplateName,
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
        status: status === 'end' ? ['5'] : ['1', '2', '3'],
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
                dealSummary: item.dealSummary || '',
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
    return request.post(`/api/deal/dealInstDetail`, {id}).then((res) => {
      const item = res.data.data;
      const {interviewCust, report, interviewInstList, supplementary} = item;
      const questionInstList = interviewInstList[0].questionInstList || [];
      const recordFile = interviewInstList[0].recordFileInstVo;
      return {
        id: item.id,
        name: item.interviewCust,
        logo: item.logo,
        status: item.status,
        desc: item.interviewDealInstDesc || '',
        progress: Number(item.progress),
        dealSummary: item.dealSummary || '',
        report,
        // 准备资料
        resources: item.resources || [],
        supplementary,
        interviewInstList: [
          questionInstList && {
            id: 'questionInstList',
            fileName: '问题清单',
            fileUrl: JSON.stringify(
              questionInstList.map((item: any) => ({id: item.id, question: item.questionInstName, answer: item.questionInstAnswer}))
            ),
            type: 'list',
          },
          recordFile && {
            id: recordFile.id,
            fileName: recordFile.recordFileName,
            fileUrl: recordFile.recordFileUrl,
            lastModifiedTime: recordFile.lastModifiedDate,
            type: 'wav',
          },
        ].filter(Boolean),
      } as any;
    });
  },
  createItem(data: ListItem): Promise<ListItem> {
    const {id, name, logo} = data;
    return request
      .post('/api/deal/createOrUpdateDealInst', {
        id: id || undefined,
        interviewCust: name,
        logo,
      })
      .then((res) => res.data.data);
  },
  deleteItem(id: string): Promise<void> {
    return request.post('/api/deal/delete', {id});
  },
  // updateItem(id: string, data: ListItem): Promise<void> {
  //   return request.post('/dream/pen/rag/contract/update', {...data, id});
  // },
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
  /** 删除尽调资料，与移动端一致：body 传 id(dealId) + fileId */
  removeResourceFile(dealId: string, fileId: string): Promise<void> {
    return request.post('/api/deal/delete-file', {id: dealId, fileId});
  },
  appendResource(id: string, text: string): Promise<void> {
    return request.post(`/api/interview/appendResource`, {interviewDealInstId: id, appendText: text});
  },

  getResourceContent(id: string): Promise<string> {
    return request.post(`/api/interview/getResourceContent`).then((res) => res.data.content);
  },
  /** 重新生成报告，与移动端一致：使用异步生成接口 */
  rebuildReport(id: string): Promise<void> {
    return request.post('/api/interview/generateInterviewInstReportAsync', {interviewDealInstId: id});
  },
  /** 更换报告模板，与移动端 changeReportTemplate 一致 */
  resetTemplate(id: string, templateId: string): Promise<void> {
    return request.post('/api/deal/changeReportTemplate', {id, templateId});
  },
  /** 重命名资料，与移动端一致：body 传 fileId + fileName（后端若需 dealId 可再加 id） */
  renameReport(dealId: string, fileId: string, fileName: string): Promise<void> {
    return request.post('/api/deal/rename', {id: dealId, fileId, fileName});
  },
  archiveItem(id: string): Promise<void> {
    return request.post('/api/deal/archive', {id});
  },
  /** 报告预览：获取可访问的预览地址，与移动端 viewReportUrl 一致 */
  viewReportUrl(fileId: string | undefined | null, fileUrl: string): Promise<{success: boolean; data?: string; message?: string}> {
    if (fileId) {
      return request.get(`/api/online/files/${fileId}/view-url`).then((res) => res.data);
    }
    let url = `/api/webInterface/url/view?url=${encodeURIComponent(fileUrl)}`;
    return request.get(url).then((res) => res.data);
  },
  
  /** 报告在线编辑：获取编辑地址 */
  editReportUrl(fileId: string): Promise<{success: boolean; data?: string; message?: string}> {
    return request.get(`/api/online/files/${fileId}/edit-info`).then((res) => res.data);
  },
  getTplPreview(id: string): Promise<{tplId: string; snapshot: string; isMine: boolean}> {
    return request.get('/dream/pen/article/get', {params: {id}}).then((docRes) => {
      const item: ItemDetail = docRes.data.data;
      const curUserId = getCurUserId();
      return {tplId: item.id, snapshot: item.snapshot, format: item.format, isMine: !item.isSystem && !!curUserId && item.createUser === curUserId};
    });
  },
  addApproveReport(params: {reportName: string; file: File}): Promise<{success: boolean; message?: string}> {
    const formData = new FormData();
    formData.append('reportName', params.reportName);
    formData.append('file', params.file);
    return request.post('/api/deal/addApproveReport', formData).then((res) => ({
      success: res?.data?.success !== false,
      message: res?.data?.message,
    }));
  },
};

export default DueDiligenceAPI;
