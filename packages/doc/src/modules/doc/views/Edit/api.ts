import {fetchEventSource} from '@microsoft/fetch-event-source';
import mockjs from 'mockjs';
import {ApiPrefix} from '@/Global';
import request from '@/utils/request';
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
// fetch('/dream/pen/ai/writer/test', {
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

function replaceBaseUrl(url: string) {
  ///dream/pen/ai/writer/test
  return url.replace(/^\/(dream|ai)\//, (pre) => ApiPrefix[pre]);
}

const continueWrite: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt, context} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/continued'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({type: 'continued', continuedType: 'paragraph', conversation_id: docId, prompt, content: context}),
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
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/fullText'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({type: 'fullText', conversation_id: docId, prompt}),
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
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/outline'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({type: 'outline', conversation_id: docId, prompt}),
    signal,
    onmessage(ev) {
      onMessage(decodeMessage(ev.data));
    },
    onerror: onError,
    onclose: onDone,
  });
  return controller;
};

const stylize: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt, context} = args;
  const req = {
    url: '/dream/pen/ai/writer/continued',
    body: {type: '', conversation_id: docId, prompt: context},
  };
  if (prompt === '精简内容') {
    req.url = '/dream/pen/ai/writer/simplify';
    req.body.type = 'simplify';
  } else if (prompt === '生成摘要') {
    req.url = '/dream/pen/ai/writer/summary';
    req.body.type = 'summary';
  } else if (prompt === '丰富内容') {
    req.url = '/dream/pen/ai/writer/more';
    req.body.type = 'summary';
  }
  fetchEventSource(replaceBaseUrl(req.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
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

const ask: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/customize'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({type: 'customize', conversation_id: docId, prompt}),
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
  continueWrite,
  createFullText,
  createOutline,
  stylize,
  ask,
  async byTemplate(docId: string, content: string): Promise<string> {
    return request
      .post(`/dream/pen/ai/full/text `, {
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
