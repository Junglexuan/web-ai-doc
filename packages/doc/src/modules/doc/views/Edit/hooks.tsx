import {MutableRefObject, useCallback, useEffect, useRef, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import {AIRequest, RunningState} from './api';
import type {IAIRef} from './AILayer';

export interface AIDialogHooks {
  runningState: RunningState;
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
  onKnowledgeChange: (knowledge: string[]) => void;
}

export function useAIDialog(
  aiRef: IAIRef,
  onRunningStateChange: (runningState: RunningState) => void,
  onRequest: AIRequest,
  args?: {[key: string]: string},
  withContext?: boolean,
  required?: boolean,
  title?: string
): AIDialogHooks {
  const [runningState, setRunningState] = useState<RunningState>('');
  const inputRef = useRef<{getValue: () => string; focus: () => void}>(null as any);
  const [fragment, setFragment] = useState('');
  const rawRef = useRef('');
  const [sessionId] = useState(Date.now() + '');
  const fragmentRef = useRef<HTMLDivElement>();
  const requestRef = useRef<AbortController>();
  const [model, setModel] = useState('qwen-max');
  const [knowledge, setKnowledge] = useState<string[]>([]);

  console.log(title);
  const onPromptSubmit = useEvent(({keep}: {keep?: boolean} = {}) => {
    const text = inputRef.current.getValue();
    if (required && !text) {
      message.error('请输入...');
      return;
    }
    if (title === '知识库问答') {
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
        knowledge: knowledge.join(','),
        ...args,
      },
      onMessage: ({html, raw}) => {
        //console.log(html);
        const scroller = fragmentRef.current!;
        setFragment(lastHtml + html);
        rawRef.current = lastRaw + raw;
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
    // .then(
    //   (html) => {
    //     setFragment(lastResult.html + html);
    //     setRunningState('Fulfilled');
    //     onRunningStateChange('Fulfilled');
    //   },
    //   () => {
    //     setRunningState('Rejected');
    //     onRunningStateChange('Rejected');
    //   }
    // );
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
    aiRef.closeMenu(true);
    const fragment = fragmentRef.current!;
    const root = fragment.children[0];
    if (root?.nodeName === 'FIGURE') {
      const imgs = Array.from(root.children)
        .map((child) => (child.className === 'on' ? child.getAttribute('data-img') : ''))
        .filter(Boolean);
      if (imgs.length) {
        aiRef.insertHtmlByAI(imgs.map((src) => `<img src="${src}" />`).join(''));
      }
    } else {
      aiRef.insertHtmlByAI(fragment.innerHTML);
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
    model,
    fragment,
    fragmentRef,
    inputRef,
    requestRef,
  };
}
