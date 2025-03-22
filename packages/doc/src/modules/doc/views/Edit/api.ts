import mockjs from 'mockjs';
import request from '@/utils/request';
import {sleep} from '@/utils/tools';

export type RunningState = '' | 'Pending' | 'Rejected' | 'Fulfilled';

export const AiAPI = {
  async continueWrite(prompt: string): Promise<string> {
    await sleep(5000);
    return `<p>机密★1年机密★1年机密★1年机密★1年机密★1年机密★1年机密★1年机密★1/年机密★1年机密★1年机密★1年机密★1年</p>
    <ul>
      <li>1.明细表支持点击数据跳转页面</li>
      <li>2.数据模型的筛选组件，条件需要支持表达式（例如获取近一周的数据）</li>
      <li> 3.数据模型需要新增topN组件（例如获取最近一次用户登录记录）</li>
    </ul>`;
    //return request.post(`/api/flow`, data);
  },
};

export default AiAPI;
