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
      model: string;
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
      if (item.success) {
        str = item.data;
      } else {
        str = '';
      }
    } catch (error) {
      str = '';
    }
    markdown += str;
    return {html: marked.parse(markdown) as string, raw: markdown};
  };
}

function decodeHtml() {
  let html = '';
  return (str: string) => {
    try {
      const item = JSON.parse(str);
      if (item.success) {
        str = item.data;
      } else {
        str = '';
      }
    } catch (error) {
      str = '';
    }
    html += str;
    return html.replace(/>\s+<br/g, '><br');
  };
}

function decodeReviews(str: string): {long: string; source: string; target: string; type: string; reason: string; level: string}[] {
  let data: any;
  try {
    data = JSON.parse(str);
  } catch (error) {
    data = null;
  }
  if (data && data.success) {
    data = data.data;
    const items = Array.isArray(data) ? data : [data];
    return items.map((item) => ({
      long: item.long,
      source: item.error_text,
      type: item.type,
      reason: item.message,
      target: item.suggestions,
      level: item.lever || '',
    }));
  } else {
    return [];
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
  const {sid, docId, prompt, context, previous, model} = args;
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
      model,
      content: context.substring(context.length - 100),
      previous: previous || undefined,
    }),
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

const createFullText: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {sid, docId, prompt, previous, model} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/fullText'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'fullText', articleId: docId, conversation_id: sid, prompt, model, previous: previous || undefined}),
    signal,
    openWhenHidden: true,
    onmessage: (ev) => onMessage(markdown(ev.data)),
    onerror: (e) => {
      console.log(e);
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
  const {sid, docId, prompt, raw, model} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/outline'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'outline', articleId: docId, conversation_id: sid, prompt, model, previous: raw || undefined}),
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

const createImage: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {sid, docId, prompt, model} = args;
  request.post('/dream/pen/ai/writer/makeImg', {type: 'makeImg', articleId: docId, conversation_id: sid, prompt, model}, {signal}).then(
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
  const {sid, docId, prompt, model, context, previous, title} = args;
  const req: {
    url: string;
    body: {type: string; articleId: string; conversation_id: string; content: string; model: string; previous?: string; tone?: string};
  } = {
    url: '',
    body: {type: '', articleId: docId, conversation_id: sid, content: context, model, previous: previous || undefined},
  };
  if (title === '精简内容') {
    req.url = '/dream/pen/ai/writer/simplify';
    req.body.type = 'simplify';
  } else if (title === '生成摘要') {
    req.url = '/dream/pen/ai/writer/excerpt';
    req.body.type = 'excerpt';
  } else if (title === '丰富内容') {
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

const ask: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {sid, docId, prompt, model, previous} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/question'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'question', articleId: docId, conversation_id: sid, prompt, model, previous: previous || undefined}),
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

const robot: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {sid, docId, prompt, model, previous} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/knowledge'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'knowledge', articleId: docId, conversation_id: sid, prompt, dialogId: model, previous: previous || undefined}),
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

const web: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {sid, docId, prompt, model, previous} = args;
  request
    .post(
      '/dream/pen/ai/writer/summaryWeb',
      {type: 'summaryWeb', articleId: docId, conversation_id: sid, url: prompt, model, previous: previous || undefined},
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

function tpl(
  args: {id: string; fields?: {[key: string]: string}; knowledges?: string[]; stand?: string},
  onMessage: (html: string) => void,
  onError: (e: any) => void,
  onDone: () => void
): AbortController {
  const controller = new AbortController();
  const {signal} = controller;
  const {id, fields = {}, knowledges, stand} = args;
  const html = decodeHtml();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/template'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({id, knowledges, standpoint: stand, fields: Object.keys(fields).map((name) => ({key: name, value: fields[name]}))}),
    signal,
    openWhenHidden: true,
    onmessage: (ev) => onMessage(html(ev.data)),
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  return controller;
}

function autoReview(
  args: {articleId: string; content: string},
  onMessage: (items: {long: string; source: string; target: string; type: string; reason: string; level: string}[]) => void,
  onError: (e: any) => void,
  onDone: () => void
): [AbortController, AbortController] {
  const reviewController = new AbortController();
  const sensitiveController = new AbortController();
  const {articleId, content} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/proofread'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({articleId, content, type: 'proofread'}),
    signal: reviewController.signal,
    openWhenHidden: true,
    onmessage: (ev) => onMessage(decodeReviews(ev.data)),
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/sensitive'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({articleId, content, type: 'sensitive'}),
    signal: sensitiveController.signal,
    openWhenHidden: true,
    onmessage: (ev) => onMessage(decodeReviews(ev.data)),
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
  });
  return [reviewController, sensitiveController];
}
function autoInspect(
  args: {articleId: string; content: string; contType: string; stand: string},
  onMessage: (items: {long: string; source: string; target: string; type: string; reason: string; level: string}[]) => void,
  onError: (e: any) => void,
  onDone: () => void
): AbortController {
  const controller = new AbortController();
  const {articleId, content, stand, contType} = args;
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/verify'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({conversation_id: articleId, content, standpoint: stand, type: 'verify'}),
    signal: controller.signal,
    openWhenHidden: true,
    onmessage: (ev) => onMessage(decodeReviews(ev.data)),
    onerror: (e) => {
      setTimeout(() => onError(e));
      throw e;
    },
    onclose: onDone,
  });
  return controller;
}

export const AiAPI = {
  continueWrite,
  createFullText,
  createOutline,
  createImage,
  stylize,
  autoReview,
  autoInspect,
  ask,
  robot,
  web,
  tpl,
  getMyKnowledges(): Promise<{label: string; value: string}[]> {
    return request.get('/dream/pen/know/dialog').then((res) => {
      return [
        {label: 'aa', value: '11'},
        {label: 'bb', value: '22'},
        {label: 'cc', value: '33'},
      ];
      // const list: any[] = res.data.data || [];
      // return list.map((item) => ({label: item.name, value: item.id}));
    });
  },
  getMyRobots(): Promise<{label: string; value: string}[]> {
    return request.get('/dream/pen/know/dialog').then((res) => {
      const list: any[] = res.data.data || [];
      return list.map((item) => ({label: item.name, value: item.id}));
    });
  },
};

export default AiAPI;
