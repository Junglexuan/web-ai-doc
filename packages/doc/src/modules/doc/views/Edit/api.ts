import {fetchEventSource} from '@microsoft/fetch-event-source';
import {marked} from 'marked';
import request, {replaceBaseUrl} from '@/utils/request';
import {getToken} from '@/utils/tools';
import {dslToHtml} from './utils';

export type RunningState = '' | 'Pending' | 'Rejected' | 'Fulfilled';

export interface AIRequest {
  (data: {
    args: {
      sid: string;
      docId: string;
      prompt: string;
      context: string;
      previous: string;
      raw: string;
      [key: string]: string;
    };
    onMessage: (data: {html: string; raw: string}) => void;
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

function decodeMarkdown() {
  let markdown = '';
  return (str: string) => {
    try {
      const item = JSON.parse(str);
      str = item.content;
    } catch (error) {
      str = '';
    }
    markdown += str;
    return {html: marked.parse(markdown) as string, raw: markdown};
  };
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
  const {sid, docId, prompt, context, previous} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/continued'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      type: 'continued',
      continuedType: 'paragraph',
      articleId: docId,
      conversation_id: sid,
      prompt,
      content: context.substring(context.length - 100),
      previous: previous || undefined,
    }),
    signal,
    onmessage: (ev) => onMessage(markdown(ev.data)),
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
  const {sid, docId, prompt, previous} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/fullText'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'fullText', articleId: docId, conversation_id: sid, prompt, previous: previous || undefined}),
    signal,
    openWhenHidden: true,
    onmessage: (ev) => onMessage(markdown(ev.data)),
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
  const {sid, docId, prompt, raw} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/outline'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'outline', articleId: docId, conversation_id: sid, prompt, previous: raw || undefined}),
    signal,
    onmessage: (ev) => onMessage(markdown(ev.data)),
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
  const {sid, docId, prompt} = args;
  request.post('/dream/pen/ai/writer/makeImg', {type: 'makeImg', articleId: docId, conversation_id: sid, prompt}, {signal}).then(
    (res) => {
      const list: any[] = res.data.data || [];
      onMessage({
        html: `<figure>${list
          .map((item, index) => '<div class="' + (!index ? 'on' : '') + '" data-img="' + item + '"><img src="' + item + '" width="170" /></div>')
          .join('')}</figure>`,
        raw: '',
      });
      setTimeout(onDone);
    },
    (e) => {
      setTimeout(() => onError(e));
    }
  );
  return controller;
};

const stylize: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {sid, docId, prompt, context, previous} = args;
  const req: {url: string; body: {type: string; articleId: string; conversation_id: string; content: string; previous?: string; tone?: string}} = {
    url: '',
    body: {type: '', articleId: docId, conversation_id: sid, content: context, previous: previous || undefined},
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
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl(req.url), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req.body),
    signal,
    onmessage: (ev) => onMessage(markdown(ev.data)),
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
  const {sid, docId, prompt, previous} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/question'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'question', articleId: docId, conversation_id: sid, prompt, previous: previous || undefined}),
    signal,
    onmessage: (ev) => onMessage(markdown(ev.data)),
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
  const {sid, docId, prompt, previous} = args;
  request
    .post(
      '/dream/pen/ai/writer/summaryWeb',
      {type: 'summaryWeb', articleId: docId, conversation_id: sid, url: prompt, previous: previous || undefined},
      {signal}
    )
    .then(
      (res) => {
        const content = res.data.data.content || '';
        onMessage({html: marked.parse(content) as string, raw: ''});
        setTimeout(onDone);
      },
      (e) => {
        setTimeout(() => onError(e));
      }
    );
  // fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/summaryWeb'), {
  //   method: 'POST',
  //   headers: getHeaders(),
  //   body: JSON.stringify({type: 'summaryWeb', conversation_id: docId, url: prompt}),
  //   signal,
  //   onmessage(ev) {
  //     onMessage(decodeMessage(ev.data, true));
  //   },
  //   onerror: (e) => {
  //     setTimeout(() => onError(e));
  //     throw e;
  //   },
  //   onclose: onDone,
  // });
  return controller;
};

function proofread(docId: string, content: string, html: string): {controller: AbortController; result: Promise<{content: string; html: string}>} {
  const controller = new AbortController();
  const {signal} = controller;
  return {
    controller,
    result: request
      .post(
        '/dream/pen/ai/writer/proofread',
        {
          articleId: docId,
          content,
          type: 'proofread',
        },
        {signal}
      )
      .then((res) => ({...res.data.data, html})),
  };
}

export const AiAPI = {
  continueWrite,
  createFullText,
  createOutline,
  createImage,
  stylize,
  proofread,
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
