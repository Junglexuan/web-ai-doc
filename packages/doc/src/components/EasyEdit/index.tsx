import {Dropdown} from 'antd';
import {FC, FormEvent, Fragment, useEffect, useMemo, useRef, useState} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';
import {EasyEditProps, ValueData, tplValue} from './types';
import {easyEditUtil} from './util';

const EasyEdit: FC<EasyEditProps> = ({tpl, value, onChange, option}): JSX.Element => {
  const editableRef = useRef<HTMLDivElement>(null);
  const [templateList, setTemplateList] = useState<tplValue[]>([]);
  const [currentValue, setCurrentValue] = useState<ValueData | undefined>(undefined);
  const selectionRef = useRef<{start: number; end: number} | null>(null);
  const isComposingRef = useRef(false);

  // 解析模板字符串
  useEffect(() => {
    const parsedTemplate = easyEditUtil.parseTemplate(tpl);
    setTemplateList(parsedTemplate);
  }, [tpl]);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const saveSelection = useEvent(() => {
    if (isComposingRef.current) return;
    const selection = window.getSelection();
    if (!selection || !editableRef.current) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editableRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    selectionRef.current = {
      start: preCaretRange.toString().length,
      end: preCaretRange.toString().length,
    };
  });

  const restoreSelection = useEvent(() => {
    if (isComposingRef.current) return;
    if (!selectionRef.current || !editableRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    let charCount = 0;
    let foundStart = false;
    let foundEnd = false;
    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;

    const walker = document.createTreeWalker(editableRef.current, NodeFilter.SHOW_TEXT, null);

    let node = walker.nextNode();
    while (node) {
      const text = node.textContent || '';
      if (!foundStart && charCount + text.length >= selectionRef.current.start) {
        startNode = node;
        startOffset = selectionRef.current.start - charCount;
        foundStart = true;
      }
      if (!foundEnd && charCount + text.length >= selectionRef.current.end) {
        endNode = node;
        endOffset = selectionRef.current.end - charCount;
        foundEnd = true;
      }
      charCount += text.length;
      node = walker.nextNode();
    }

    if (startNode && endNode) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  const menuClick = useEvent((e: any, index: number) => {
    const _text = e.key;
    console.log(e);
    handleInput({index, text: _text});
  });

  const handleInput = useEvent((itemValue?: {index: number; text: string}) => {
    if (isComposingRef.current) return;
    saveSelection();
    const editable = editableRef.current;
    if (!editable) return;
    let _text = '';
    const newSpans = templateList.map((span, index) => {
      const el = editable.querySelector<HTMLSpanElement>(`span[data-id="text_${index}"]`);
      let _elText = el?.innerText || '';
      if (itemValue && itemValue.index === index) _elText = itemValue.text;
      _text += _elText;
      return {
        ...span,
        value: _elText,
      };
    });
    const _valueData: ValueData = {
      text: _text,
      tplValue: newSpans,
    };
    console.log(_valueData);
    setCurrentValue(_valueData);
    onChange && onChange(_valueData);
    requestAnimationFrame(restoreSelection);
  });

  // 渲染模板内容
  const renderTemplate = useMemo(() => {
    if (!templateList?.length) return null;
    const _renderList = currentValue?.tplValue || templateList;
    return _renderList.map((item, index) => {
      if (item.type === 'text') {
        return (
          <span data-id={`text_${index}`} key={index}>
            {item.value || ''}
          </span>
        );
      }
      const menuItems = option?.[item.key]?.data || [];
      const _placeholder = option?.[item.key]?.placeholder || '请输入';
      return (
        <Fragment key={index}>
          <Dropdown
            menu={{items: menuItems, onClick: (e) => menuClick(e, index)}}
            overlayStyle={{minWidth: '0px', ...(!item.value ? {display: 'none'} : {})}}
            trigger={['click']}
            onOpenChange={() => {
              const editable = editableRef.current;
              if (editable) {
                const el = editable.querySelector<HTMLSpanElement>(`span[data-id="text_${index}"]`);
                if (el) {
                  const range = document.createRange();
                  range.selectNodeContents(el);
                  range.collapse(false);
                  const selection = window.getSelection();
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                  el.focus();
                }
              }
            }}
          >
            <code style={!item.value ? {display: 'none'} : {}} className={`${item.value === ' ' && styles['empty-code']} ${styles['code-box']}`}>
              <span data-id={`text_${index}`}>{item.value}</span>
              {item.value === ` ` && (
                <span className={styles['code-empty-placeholder']} contentEditable={false}>
                  {_placeholder}
                </span>
              )}
            </code>
          </Dropdown>
          <span> </span>
        </Fragment>
      );
    });
  }, [menuClick, option, templateList, currentValue?.tplValue]);

  return (
    <div className={`${styles.root} ${styles.content}`}>
      <div
        ref={editableRef}
        onInput={() => handleInput()}
        onCompositionStart={() => (isComposingRef.current = true)}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          handleInput();
        }}
        className={styles['edit-box']}
        contentEditable={true}
        suppressContentEditableWarning
      >
        {renderTemplate}
      </div>
    </div>
  );
};

export default EasyEdit;
// import React, {useState} from 'react';

// const HighlightText = () => {
//   const [highlighted, setHighlighted] = useState('');

//   const handleMouseUp = () => {
//     const selection = window.getSelection();
//     const text = selection?.toString();
//     if (text) {
//       setHighlighted(text);
//       selection?.removeAllRanges();
//     }
//   };

//   const renderTextWithHighlight = () => {
//     const fullText = '这是一段可以被选中的文字，试试看选中它的一部分。';

//     if (!highlighted || !fullText.includes(highlighted)) {
//       return fullText;
//     }

//     const [before, after] = fullText.split(highlighted);

//     return (
//       <>
//         {before}
//         <span
//           style={{
//             backgroundColor: '#BBDDFF', // 模拟原生 selection 的浅蓝色
//             color: 'inherit',
//           }}
//         >
//           {highlighted}
//         </span>
//         {after}
//       </>
//     );
//   };

//   return (
//     // <div style={{padding: 20, lineHeight: 1.8}}>
//     //   <p onMouseUp={handleMouseUp}>{renderTextWithHighlight()}</p>
//     //   <input type="text" placeholder="点击输入框，高亮仍保留" style={{marginTop: 20}} />
//     // </div>
//     <div style={{padding: 20, lineHeight: 1.8}}>
//       <p onMouseUp={handleMouseUp}>{renderTextWithHighlight()}</p>
//       <p>woahsadfwosdlfjsjflsdjflsdjlffjsd</p>
//       <p>测试选中搞定啦啦啥的姐夫搜打飞机搜打飞机蓝色点击了解熟练的地方是多了几分蓝色点击</p>
//       <iframe
//         style={{width: '1200px', height: '200px'}}
//         srcDoc={`<div style='width: 300px; height: 200px; background-color: red;'>
//               <input type='text' placeholder='点击输入框，高亮仍保留' style='margin-top: 20px;' />
//             </div>`}
//       />
//     </div>
//   );
// };
// export default HighlightText;
