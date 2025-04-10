import {fetchEventSource} from '@microsoft/fetch-event-source';
import mockjs from 'mockjs';
import request from '@/utils/request';
import {sleep} from '@/utils/tools';
import {dslToHtml} from './utils';

export type RunningState = '' | 'Pending' | 'Rejected' | 'Fulfilled';

export interface AIRequest {
  (data: {
    args: {
      docId: string;
      prompt: string;
      context: string;
      [key: string]: string;
    };
    onMessage: (html: string) => void;
    onError: (e: any) => void;
    onDone: () => void;
  }): AbortController;
}

//window['dslToHtml'] = dslToHtml;
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

const continueWrite: AIRequest = ({args, onMessage, onError, onDone}) => {
  const {continuedType, docId, prompt, context} = args;
  fetchEventSource('http://331qy963dj35.vicp.fun:15537/dream/pen/ai/writer/continued', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({type: 'continued', continuedType, conversation_id: docId, prompt: context}),
    signal,
    onmessage: (ev) => onMessage(decodeMessage(ev.data)),
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  return controller;
};

const createFullText: AIRequest = ({args, onMessage, onError, onDone}) => {
  const {docId, prompt} = args;
  fetchEventSource('http://331qy963dj35.vicp.fun:15537/dream/pen/ai/writer/continued', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({type: 'continued', conversation_id: docId, prompt}),
    signal,
    onmessage: (ev) => onMessage(decodeMessage(ev.data)),
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  return controller;
};

const createOutline: AIRequest = ({args, onMessage, onError, onDone}) => {
  const {docId, content} = args;
  fetchEventSource('http://331qy963dj35.vicp.fun:15537/dream/pen/ai/writer/outline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({type: 'outline', conversation_id: docId, prompt: content}),
    signal,
    onmessage(ev) {
      onMessage(decodeMessage(ev.data));
    },
    onerror: onError,
    onclose: onDone,
  });
  return controller;
};

export const AiAPI = {
  stop(): void {
    controller.abort();
  },
  continueWrite,
  createFullText,
  createOutline,
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
