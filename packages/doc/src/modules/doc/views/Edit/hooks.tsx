import {MutableRefObject, useCallback, useEffect, useRef, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import {AIRequest, RunningState} from './api';
import type {IAIRef} from './AILayer';

export interface AIDialogHooks {
  runningState: RunningState;
  fragment: string;
  fragmentRef: MutableRefObject<HTMLDivElement | undefined>;
  inputRef: MutableRefObject<{getValue: () => string}>;
  requestRef: MutableRefObject<AbortController | undefined>;
  aiRef: IAIRef;
  onPromptSubmit: (data?: any) => void;
  onRedo: () => void;
  onKeep: () => void;
  onStop: () => void;
  onInsert: () => void;
}

export function useAIDialog(
  aiRef: IAIRef,
  onRunningStateChange: (runningState: RunningState) => void,
  onRequest: AIRequest,
  args?: {[key: string]: string},
  withContext?: boolean,
  required?: boolean
): AIDialogHooks {
  const [runningState, setRunningState] = useState<RunningState>('');
  const inputRef = useRef<{getValue: () => string}>(null as any);
  const [fragment, setFragment] = useState('');
  const fragmentRef = useRef<HTMLDivElement>();
  const requestRef = useRef<AbortController>();

  const onPromptSubmit = useEvent(({keep}: {keep?: boolean} = {}) => {
    const text = inputRef.current.getValue();
    if (required && !text) {
      message.error('请输入...');
      return;
    }
    setRunningState('Pending');
    onRunningStateChange('Pending');

    requestRef.current = onRequest({
      args: {
        docId: aiRef.getDocId(),
        prompt: keep ? '继续写' : text,
        context: !withContext ? '' : aiRef.getContext(),
        ...args,
      },
      onMessage: (html) => {
        console.log(html);
        const scroller = fragmentRef.current!;
        setFragment(scroller.innerHTML + html);
        scroller.scrollTo({top: 999999999});
      },
      onError: (e) => {
        console.log(e);
        setRunningState('Rejected');
        onRunningStateChange('Rejected');
      },
      onDone: () => {
        setRunningState('Fulfilled');
        onRunningStateChange('Fulfilled');
        aiRef.focusEditor();
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

  const onStop = useEvent(() => {
    requestRef.current?.abort();
    setTimeout(() => {
      setRunningState('Fulfilled');
      onRunningStateChange('Fulfilled');
    });
  });

  const onInsert = useEvent(() => {
    aiRef.closeMenu();
    aiRef.insertHtmlByAI(fragmentRef.current!.innerHTML);
  });

  useEffect(() => {
    //inputRef.current.input.focus();
  }, []);

  return {aiRef, onPromptSubmit, onRedo, onKeep, onStop, onInsert, runningState, fragment, fragmentRef, inputRef, requestRef};
}
