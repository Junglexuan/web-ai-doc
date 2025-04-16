import {TemplateItem, tplValue} from './types';

export const easyEditUtil = {
  /**
   * 分割模板字符串为模板数组
   * @param str 模板字符串
   * @returns 返回指定结构得数组
   */
  parseTemplate: (str: string): tplValue[] => {
    const regex = /\$\{(.*?)\}/g;
    const result: tplValue[] = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(str)) !== null) {
      const index = match.index;
      // 添加前面的文本
      if (index > lastIndex) {
        result.push({
          key: str.slice(lastIndex, index),
          type: 'text',
          value: str.slice(lastIndex, index),
        });
      }
      // 添加变量
      result.push({
        key: match[1],
        type: 'variable',
        value: ' ', //空字符串
      });
      // 更新上一次匹配的结束位置
      lastIndex = index + match[0].length;
    }
    // 处理最后一个变量后的文本
    if (lastIndex < str.length) {
      result.push({
        key: str.slice(lastIndex),
        type: 'text',
        value: str.slice(lastIndex),
      });
    }

    return result;
  },
};
