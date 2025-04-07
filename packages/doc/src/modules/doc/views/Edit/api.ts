import {fetchEventSource} from '@microsoft/fetch-event-source';
import mockjs from 'mockjs';
import request from '@/utils/request';
import {sleep} from '@/utils/tools';
import {dslToHtml} from './utils';

export type RunningState = '' | 'Pending' | 'Rejected' | 'Fulfilled';

//window['dslToHtml'] = dslToHtml;

const controller = new AbortController();
const {signal} = controller;

function decodeMessage(str: string): string {
  let result: any = [];
  if (str) {
    try {
      result = JSON.parse(str);
    } catch (e) {
      result = [];
    }
  }
  return dslToHtml(result);
}

export const AiAPI = {
  stop(): void {
    controller.abort();
  },
  continueWrite({
    args,
    onMessage,
    onError,
    onDone,
  }: {
    args: {docId: string; context: string; continuedType: 'paragraph' | 'header1'};
    onMessage: (data: string) => void;
    onError: (e: any) => void;
    onDone: () => void;
  }): AbortController {
    // await sleep(5000);
    // return `<p>机密★1年机密★1年机密★1年机密★1年机密★1年机密★1年机密★1年机密★1/年机密★1年机密★1年机密★1年机密★1年</p>
    // <ul>
    //   <li>1.明细表支持点击数据跳转页面</li>
    //   <li>2.数据模型的筛选组件，条件需要支持表达式（例如获取近一周的数据）</li>
    //   <li> 3.数据模型需要新增topN组件（例如获取最近一次用户登录记录）</li>
    // </ul>`;
    // return request
    //   .post(`/dream/dream/pen/ai/writer/continued `, {
    //     conversation_id: docId,
    //     prompt: context,
    //   })
    //   .then((res) => {
    //     const html = dslToHtml(res.data.data);
    //     console.log(html);
    //     return html;
    //   });
    const {continuedType, docId, context} = args;
    fetchEventSource('http://331qy963dj35.vicp.fun:15537/dream/pen/ai/writer/continued', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({continuedType, type: 'continued', conversation_id: docId, prompt: context}),
      signal,
      onmessage(ev) {
        onMessage(decodeMessage(ev.data));
      },
      onerror: onError,
      onclose: onDone,
    });
    return controller;
    // fetch('http://331qy963dj35.vicp.fun:15537/dream/pen/ai/writer/test', {
    //   method: 'POST',
    //   signal,
    //   headers: {
    //     'content-type': 'application/json',
    //   },
    //   body: JSON.stringify({continuedType, type: 'continued', conversation_id: docId, prompt: context}),
    // })
    //   .then(async (response: any) => {
    //     const reader = response.body.getReader();
    //     while (true) {
    //       const {done, value} = await reader.read();
    //       if (done) break;
    //       const data = new TextDecoder().decode(value);
    //       console.log('====', data);
    //       //console.log(value);
    //       //console.log(new TextDecoder().decode(value));
    //     }
    //   })
    //   .catch((error) => {
    //     console.error('Fetch error:', error);
    //   });
  },
  async createOutline(docId: string, content: string): Promise<string> {
    console.log();
    // await sleep(5000);
    // return `<p>机密★1年机密★1年机密★1年机密★1年机密★1年机密★1年机密★1年机密★1/年机密★1年机密★1年机密★1年机密★1年</p>
    // <ul>
    //   <li>1.明细表支持点击数据跳转页面</li>
    //   <li>2.数据模型的筛选组件，条件需要支持表达式（例如获取近一周的数据）</li>
    //   <li> 3.数据模型需要新增topN组件（例如获取最近一次用户登录记录）</li>
    // </ul>`;
    return request
      .post(`/dream/dream/pen/ai/onLink `, {
        conversation_id: docId,
        content,
      })
      .then((res) => {
        const html = dslToHtml(res.data.data);
        console.log(html);
        return html;
      });
  },
  async byTemplate(docId: string, content: string): Promise<string> {
    return request
      .post(`/dream/dream/pen/ai/full/text `, {
        conversation_id: docId,
        content,
      })
      .then((res) => {
        const html = dslToHtml(res.data.data);
        console.log(html);
        return html;
      });
  },
};

export default AiAPI;
