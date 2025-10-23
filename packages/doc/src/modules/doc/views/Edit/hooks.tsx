import {snapdom} from '@zumer/snapdom';
import {MutableRefObject, useCallback, useEffect, useRef, useState} from 'react';
import {uploadFile} from '@/utils/request';
import {message, useEvent} from '@/utils/tools';
import {AIAction, AIRequest, RunningState} from './api';
import type {IAIRef} from './AILayer';

const snapshot = async (root: HTMLElement) => {
  return new Promise<string>((resolve) => {
    setTimeout(async () => {
      // const result = await snapdom();
      const imgBlob = await snapdom.toBlob(root);
      const formData = new FormData();
      formData.append('file', imgBlob, 'snapshot.png');
      const {url} = await uploadFile('/dream/pen/upload/img', formData);
      resolve(url);
    }, 1000);
  });
};
export interface AIDialogHooks {
  runningState: RunningState;
  insertLoading?: boolean;
  fragment: string;
  model: string;
  fragmentRef: MutableRefObject<HTMLDivElement | undefined>;
  inputRef: MutableRefObject<{getValue: () => string; focus: () => void}>;
  requestRef: MutableRefObject<AbortController | undefined>;
  aiRef: IAIRef;
  onPromptSubmit: (data?: any) => void;
  onRedo: () => void;
  onKeep: () => void;
  onStop: () => void;
  onInsert: () => void;
  onAdjust: () => void;
  onModelChange: (model: string) => void;
  onKnowledgeChange: (knowledge: string) => void;
}

export function useAIDialog(
  action: string,
  aiRef: IAIRef,
  onRunningStateChange: (runningState: RunningState) => void,
  onRequest: AIRequest,
  args?: {[key: string]: string},
  withContext?: boolean,
  required?: boolean
): AIDialogHooks {
  const [runningState, setRunningState] = useState<RunningState>('');
  const [insertLoading, setInsertLoading] = useState<boolean>();
  const inputRef = useRef<{getValue: () => string; focus: () => void}>(null as any);
  const [fragment, setFragment] = useState('');
  const rawRef = useRef('');
  const [sessionId] = useState(Date.now() + '');
  const fragmentRef = useRef<HTMLDivElement>();
  const requestRef = useRef<AbortController>();
  const [model, setModel] = useState('qwen-max');
  const [knowledge, setKnowledge] = useState<string>('');

  const onPromptSubmit = useEvent(({keep}: {keep?: boolean} = {}) => {
    const text = inputRef.current.getValue();
    if (required && !text) {
      message.error('请输入...');
      return;
    }
    if (action === AIAction.ZSKWD) {
      if (!model) {
        message.error('请选择智能体...');
        return;
      }
    }
    setRunningState('Pending');
    onRunningStateChange('Pending');

    let lastText: string = '';
    let lastHtml: string = '';
    let lastRaw: string = '';
    if (keep) {
      lastHtml = fragmentRef.current?.innerHTML || '';
      lastRaw = rawRef.current;
      const children = Array.from(fragmentRef.current?.children || []) as HTMLElement[];
      const last3 = children.pop()?.innerText;
      const last2 = children.pop()?.innerText;
      const last1 = children.pop()?.innerText;
      lastText = [last1, last2, last3].filter(Boolean).join('\n');
    }
    requestRef.current = onRequest({
      args: {
        sid: sessionId,
        docId: aiRef.getDocId(),
        prompt: keep ? '继续写' : text,
        context: !withContext ? '' : aiRef.getContext(),
        previous: lastText,
        raw: lastRaw,
        model,
        knowledge,
        action,
        ...args,
      },
      onMessage: ({html, raw}) => {
        setFragment(lastHtml + html);
        rawRef.current = lastRaw + raw;
        const scroller = fragmentRef.current!;
        scroller.scrollTo({top: 999999999});
      },
      onError: (e) => {
        setRunningState('Rejected');
        onRunningStateChange('Rejected');
      },
      onDone: () => {
        setRunningState('Fulfilled');
        onRunningStateChange('Fulfilled');
      },
    });
  });
  const onRedo = useCallback(() => {
    setFragment('');
    setTimeout(onPromptSubmit);
  }, [onPromptSubmit]);

  const onKeep = useCallback(() => {
    onPromptSubmit({keep: true});
  }, [onPromptSubmit]);

  const onAdjust = useEvent(() => {
    setFragment('');
    setRunningState('');
    onRunningStateChange('');
    setTimeout(inputRef.current.focus);
  });

  const onStop = useEvent(() => {
    requestRef.current?.abort();
    setTimeout(() => {
      setRunningState('Fulfilled');
      onRunningStateChange('Fulfilled');
    });
  });

  const onInsert = useEvent(() => {
    const fragment = fragmentRef.current!;
    const root = fragment.children[0] as HTMLElement;
    if (action === AIAction.SJZNT) {
      setInsertLoading(true);
      snapshot(root)
        .then((url) => {
          aiRef.closeMenu(true);
          if (url) {
            aiRef.insertHtmlByAI(`<img src="${url}" />`, action);
          }
        })
        .finally(() => {
          setInsertLoading(false);
        });
      return;
    }
    aiRef.closeMenu(true);
    if (root?.nodeName === 'FIGURE') {
      const imgs = Array.from(root.children)
        .map((child) => (child.className === 'on' ? child.getAttribute('data-img') : ''))
        .filter(Boolean);
      if (imgs.length) {
        aiRef.insertHtmlByAI(imgs.map((src) => `<img src="${src}" />`).join(''), action);
      }
    } else {
      aiRef.insertHtmlByAI(fragment.innerHTML, action);
    }
  });

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return {
    aiRef,
    onPromptSubmit,
    onRedo,
    onKeep,
    onStop,
    onInsert,
    onAdjust,
    onModelChange: setModel,
    onKnowledgeChange: setKnowledge,
    runningState,
    insertLoading,
    model,
    fragment,
    fragmentRef,
    inputRef,
    requestRef,
  };
}
