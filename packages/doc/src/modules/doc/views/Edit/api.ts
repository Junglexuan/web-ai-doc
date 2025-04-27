import {fetchEventSource} from '@microsoft/fetch-event-source';
import {marked} from 'marked';
import request, {replaceBaseUrl} from '@/utils/request';
import {getToken} from '@/utils/tools';
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

function decodeMessage(str: string, markdown?: boolean): string {
  let result: any = [];
  if (str) {
    try {
      result = JSON.parse(str);
    } catch (e) {
      result = [];
    }
  }
  if (markdown) {
    return result.content ? (marked.parse(result.content) as string) : '';
  } else {
    return dslToHtml(result);
  }
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: getToken(),
  };
}
const continueWrite: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt, context} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/continued'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      type: 'continued',
      continuedType: 'paragraph',
      conversation_id: docId,
      prompt,
      content: context.substring(context.length - 100),
    }),
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
    headers: getHeaders(),
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
    headers: getHeaders(),
    body: JSON.stringify({type: 'outline', conversation_id: docId, prompt}),
    signal,
    onmessage(ev) {
      onMessage(decodeMessage(ev.data));
    },
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  return controller;
};

const createImage: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/makeImg'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'makeImg', conversation_id: docId, prompt}),
    signal,
    onmessage(ev) {
      let result: string[] = [];
      if (ev.data) {
        try {
          result = JSON.parse(ev.data);
        } catch (e) {
          result = [];
        }
      }
      // onMessage(`<figure>${result.map((item) => '<div style="background-image:url(' + item + ')"></div>').join('')}</figure>`);
      if (result.length) {
        onMessage(
          `<figure>${result
            .map((item, index) => '<div class="' + (!index ? 'on' : '') + '" data-img="' + item + '"><img src="' + item + '" width="170" /></div>')
            .join('')}</figure>`
        );
      }
    },
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  return controller;
};

const stylize: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt, context} = args;
  const req: {url: string; body: {type: string; conversation_id: string; content: string; tone?: string}} = {
    url: '',
    body: {type: '', conversation_id: docId, content: context},
  };
  if (prompt === '精简内容') {
    req.url = '/dream/pen/ai/writer/simplify';
    req.body.type = 'simplify';
  } else if (prompt === '生成摘要') {
    req.url = '/dream/pen/ai/writer/excerpt';
    req.body.type = 'excerpt';
  } else if (prompt === '丰富内容') {
    req.url = '/dream/pen/ai/writer/enrich';
    req.body.type = 'enrich';
  } else {
    req.url = '/dream/pen/ai/writer/polish';
    req.body.type = 'polish';
    req.body.tone = prompt;
  }
  fetchEventSource(replaceBaseUrl(req.url), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req.body),
    signal,
    onmessage(ev) {
      onMessage(decodeMessage(ev.data));
    },
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
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/question'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'question', conversation_id: docId, prompt}),
    signal,
    onmessage(ev) {
      onMessage(decodeMessage(ev.data));
    },
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  return controller;
};
const web: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {docId, prompt} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/summaryWeb'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'summaryWeb', conversation_id: docId, url: prompt}),
    signal,
    onmessage(ev) {
      onMessage(decodeMessage(ev.data, true));
    },
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  return controller;
};

export const AiAPI = {
  continueWrite,
  createFullText,
  createOutline,
  createImage,
  stylize,
  ask,
  web,
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
