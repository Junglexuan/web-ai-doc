import {ReactNode} from 'react';

export interface ValueData {
  /**
   * 当前文本值
   */
  text: string;
  /**
   * 当前值对象
   */
  tplValue: tplValue[];
}
export interface tplValue extends TemplateItem {
  value: string;
}
export interface EasyEditProps {
  /**
   * 当前模板字符串 格式为'str1${key1}str2${key2}str3...'
   */
  tpl: string;
  /**
   * 当前输入值
   */
  value?: ValueData;
  /**
   * 模板字符串选项组件option
   */
  option?: tplOption;
  /**
   * 值改变事件
   * @param value ValueData
   * @returns void
   */
  onChange?: (value: ValueData) => void;
  onSubmit: () => void;
}

export interface TemplateItem {
  key: string;
  type: 'text' | 'variable';
}
/**
 * tpl模板option定义
 */
export type tplOption = {
  [key: string]: {
    placeholder?: string;
    data: {
      key: string | number;
      label: string | ReactNode;
    }[];
  };
};
