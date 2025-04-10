import {FC, MutableRefObject, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useEvent} from '@/utils/tools';
import {AIRequest, RunningState} from './api';
import type {IAIRef} from './AILayer';

export interface AIDialogHooks {
  runningState: RunningState;
  fragment: string;
  fragmentRef: MutableRefObject<HTMLDivElement | undefined>;
  inputRef: MutableRefObject<any>;
  requestRef: MutableRefObject<AbortController | undefined>;
  aiRef: IAIRef;
  onPromptSubmit: () => void;
  onRedo: () => void;
  onLoop: () => void;
  onStop: () => void;
  onInsert: () => void;
}

export function useAIDialog(
  aiRef: IAIRef,
  onRunningStateChange: (runningState: RunningState) => void,
  onRequest: AIRequest,
  args?: {[key: string]: string},
  withContext?: boolean
): AIDialogHooks {
  const [runningState, setRunningState] = useState<RunningState>('');
  const inputRef = useRef<any>();
  const [fragment, setFragment] = useState('');
  const fragmentRef = useRef<HTMLDivElement>();
  const requestRef = useRef<AbortController>();

  const onPromptSubmit = useEvent(() => {
    const text = inputRef.current.input.value;
    setRunningState('Pending');
    onRunningStateChange('Pending');
    requestRef.current = onRequest({
      args: {
        docId: aiRef.getDocId(),
        prompt: text,
        context: !withContext ? '' : fragment ? aiRef.getContext() + fragmentRef.current!.innerText : aiRef.getContext(),
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

  const onLoop = useCallback(() => {
    onPromptSubmit();
  }, [onPromptSubmit]);

  const onStop = useEvent(() => {
    requestRef.current?.abort();
    setRunningState('Fulfilled');
    onRunningStateChange('Fulfilled');
  });

  const onInsert = useEvent(() => {
    aiRef.closeMenu();
    aiRef.insertHtmlByAI(fragmentRef.current!.innerHTML);
  });

  useEffect(() => {
    inputRef.current.input.focus();
  }, []);

  return {aiRef, onPromptSubmit, onRedo, onLoop, onStop, onInsert, runningState, fragment, fragmentRef, inputRef, requestRef};
}
