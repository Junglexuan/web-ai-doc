import {fetchEventSource} from '@microsoft/fetch-event-source';
import {marked} from 'marked';
import request, {replaceBaseUrl} from '@/utils/request';
import {getTenant, getToken} from '@/utils/tools';
import {dslToHtml} from './utils';

const ansewerData: {dsl: any; [key: string]: any} = {
  dataTables: [
    {
      tableDisplayName: '合同订单表',
      tableName: 'order_contract',
    },
  ],
  sqlInterpretation:
    '你希望了解销售合同类型的占比分布情况，这是一个分类比例分析问题。需要将合同类型设为维度字段，预计合同金额作为指标字段，通过计算不同合同类型的金额占总金额的比例来展示其分布情况。用户问题未包含时间限制，因此不涉及时间范围筛选。',
  dataBase: '合同订单表',
  trace: [
    '2025-08-28 16:44:54:541 - [1-1] 请求大模型预制参数，faqProperties=FAQProperties(sqlUrl=http://8.130.107.206:5679/api/v1/chat/completions2, ssoUrl=null, dslUrl=http://8.130.107.206:5679/api/v1/chat/completionsdsl, callAITimeout=120, chatMode=chat_with_db_execute, modeName=null, knowUrl=http://8.130.107.206:6000/analyze, registerUrl=http://8.130.107.206:5679/api/v1/chat/register, registerDelUrl=http://8.130.107.206:5679/api/v1/chat/unregister, sqlInterpretationUrl=http://8.130.107.206:5679/chat/api/zov/parse, ackUrl=http://116.204.111.162:8078/robot/register/config/update, traceFlg=true, fewShotAddUrl=http://8.130.107.206:5679/api/v1/chat/fewshot/add, fewShotUpdateUrl=http://8.130.107.206:5679/api/v1/chat/fewshot/update, fewShotDeleteUrl=http://8.130.107.206:5679/api/v1/chat/fewshot/delete, embeddingUrl=http://8.130.107.206:5679/api/v1/zov_embeddings, recognizeDomainWithAI=true, recognizeDomainUrl=http://8.130.107.206:5679/api/v1/chat/intent/domains/similar, recognizeDomainWithAIUrl=http://8.130.107.206:5679/api/v1/chat/intent/domains/model, recognizeDomainTimeout=10000, disableDomainRecognize=false)',
    '2025-08-28 16:44:54:544 - [1-2] 机器人配置请求结果：86,037,910,274,048 {"sourceId":0,"agencyID":1950091605635035138,"permission":"0","aiModelName":"tongyi_proxyllm","dataParse":"1","sourceLogicName":"igadhjbabhdbie","registerId":"86037910173184","resisterType":"SINGLE","appID":0,"chatModeName":"chat_with_db_execute","aiModelId":76589737620480,"sqlAndDsl":""}',
    '2025-08-28 16:44:54:545 - [2] - 问题是否命中缓存 - false',
    '2025-08-28 16:44:54:545 - [4] - 问题关键词联想业务属性信息补全 []',
    '2025-08-28 16:44:54:549 - [5] - 业务术语文本替换后最终问题： 销售合同类型 占比分布情况',
    '2025-08-28 16:44:54:550 - [6] - 业务术语提示词： null',
    '2025-08-28 16:45:00:096 - 【业务领域识别】结果:null',
    '2025-08-28 16:45:00:101 - [7] - 反向查找表和字段无结果',
    '2025-08-28 16:45:00:101 - [8] - 提示词模板：null',
    '2025-08-28 16:45:00:102 - [9] - 采用以下策略调用AI ：串行执行',
    "['Table:order_contract\\n Comment:合同订单表\\n Fields:(monetary:(预计合同金额, 此字段单位为：元, 字段单位:元) \\n remark:(补充说明) \\n created_at:(created_at) \\n contract_type:(合同类型) \\n contract_contents:(合同内容) \\n customer_name:(客户名称) \\n is_sign:(是否签署) \\n id:(id) \\n fangshi:(合同收入确认方式) \\n sign_age:(签署年份))', 'Table:income_yuce\\n Comment:收入预测表, desc:(此表下所有金额单位均为：万元)\\n Fields:(AIyingyong:(AI应用（自营线上）) \\n hetong:(技术开发服务合同) \\n pingtai_xianshang:(平台线上运营（孵化伙伴AI应用）) \\n xianxia_xiaoshou:(平台线下销售) \\n jiejuefangan:(行业解决方案类) \\n nianfen:(年份))', 'Table:profit_yuce\\n Comment:盈利预测表, desc:(此表下所有金额单位均为：万元)\\n Fields:(taking:(营业收入) \\n number_employee:(公司人数) \\n taxes_surcharges:(税金及附加) \\n operating_costs:(营业成本) \\n nonbusiness_income:(营业外收入) \\n operating_support:(营业外支出) \\n evelopment_expenditure:(研发费用) \\n year_yuce:(年份) \\n obtained_expenses:(所得费用) \\n administration_expense:(管理费用) \\n financial_cost:(财务费用) \\n retained_profits:(净利润) \\n selling_expenses:(销售费用) \\n total_profit:(利润总额) \\n operating_profit:(营业利润))']",
    '\n请根据用户选择的数据库和该库的部分可用表结构定义来回答用户问题.请只根据当前问题生成SQL查询，不考虑之前的信息或上下文。\n数据库名:\n  \n表结构定义:\n  [\'Table:order_contract\\n Comment:合同订单表\\n Fields:(monetary:(预计合同金额, 此字段单位为：元, 字段单位:元) \\n remark:(补充说明) \\n created_at:(created_at) \\n contract_type:(合同类型) \\n contract_contents:(合同内容) \\n customer_name:(客户名称) \\n is_sign:(是否签署) \\n id:(id) \\n fangshi:(合同收入确认方式) \\n sign_age:(签署年份))\', \'Table:income_yuce\\n Comment:收入预测表, desc:(此表下所有金额单位均为：万元)\\n Fields:(AIyingyong:(AI应用（自营线上）) \\n hetong:(技术开发服务合同) \\n pingtai_xianshang:(平台线上运营（孵化伙伴AI应用）) \\n xianxia_xiaoshou:(平台线下销售) \\n jiejuefangan:(行业解决方案类) \\n nianfen:(年份))\', \'Table:profit_yuce\\n Comment:盈利预测表, desc:(此表下所有金额单位均为：万元)\\n Fields:(taking:(营业收入) \\n number_employee:(公司人数) \\n taxes_surcharges:(税金及附加) \\n operating_costs:(营业成本) \\n nonbusiness_income:(营业外收入) \\n operating_support:(营业外支出) \\n evelopment_expenditure:(研发费用) \\n year_yuce:(年份) \\n obtained_expenses:(所得费用) \\n administration_expense:(管理费用) \\n financial_cost:(财务费用) \\n retained_profits:(净利润) \\n selling_expenses:(销售费用) \\n total_profit:(利润总额) \\n operating_profit:(营业利润))\']\n\n表关系:\n  None\n  \n要求：\n    a) 识别用户问题中的日期描述类型（绝对日期如"2024年"或相对日期如"上个月"）\n    b) 若为相对日期，基于当前日期(2025年8月28日)计算具体起止日期（如"最近三个月"需转换为具体日期范围）\n    c) 生成sql时，必须为明确的绝对日期格式（YYYY-MM或YYYY-MM-DD）\n    d) 生成sql 若有给出字段单位则表别名中加上字段单位（如：\'销售额（万元）\'）\n    e) 若查询的字段附有格式，请用日期转换函数转换成该格式\n\n约束:\n    1. 请根据用户问题理解用户意图，使用给出表结构定义创建一个语法正确的  sql，如果不需要sql，则直接回答用户问题。\n    2. 只能使用表结构信息中提供的表来生成 sql，如果无法根据提供的表结构中生成 sql ，请返回 "" 禁止随意捏造信息。\n    3. 请注意生成SQL时不要弄错表和列的关系\n    4. 请检查SQL的正确性，并保证正确的情况下优化查询性能\n    5. 年份为提交时间在所在年份的订单。\n    6. 请不要输出SQL以外的语言。\n    7. SQL中请不要输出\\n等特殊字符。\n    8. 数据库表名，字段名中间不能加入空格\n    9. SQL中允许包含@，#符号\n    10. 请确保生成的格式为正确的json格式\n    11. 不要在表名之前加上数据库名字\n    12. SQL 必须生成为一行, 不能分行\n    13. 请注意生成SQL时考虑业务术语。\n    15. 请注意生成SQL时考虑参考例子中的问题和SQL信息\n    16. 请注意生成SQL时不限制查询结果条数\n    17. sql 中不能出现 select *\n    18. like 中 value 必须 %value% 格式\n    19. 错误信息中如果包含了 no such column: value 或者 no such table: value，请再次生成sql时必须考虑value,以保证sql的正确性\n    20. 生成的sql语句必须使用双引号包裹\n    21. 请反复对照表中的字段是否正确，不能编造字段\n    22. 重要：如果用户请求的字段不存在于提供的表结构中，返回错误信息 "给定的问题无法生成sql"，不要编造字段。\n    23. 当前时间是2025年。\n    24. 今日,今天采用CURRENT_DATE()函数。\n    25. 请生成SQL语句时确保所有关键词、表名、字段名之间必须保留空格，禁止关键词、函数、字段、表名拼接在一起。\n    26. 请使用简洁的列别名，所有SQL输出必须as为中文名字，内容必须少于10个字符, 且使用反单引号包裹。\n    27. 生成SQL的数据库表名需要使用别名,例如：FROM HK_SHARE_FINANCIAL_DATA_1 AS h\n    28. SQL生成字段的AS别名请使用英文，不要使用拼音\n\n    \n\n    \n      \n历史信息:\n    \n用户问题:\n    销售合同类型 占比分布情况\n业务术语：\n    \n参考例子:\n    \n请一步步思考并按照以下json格式回复：\n    "{\\n    \\"sql\\": \\"SQL Query to run\\"\\n}"\n\n请考虑上一次生成SQL的错误信息：\n\n    \n',
    '2025-08-28 16:45:11:102 - 【最终SQL校验】：SELECT * FROM (SELECT contract_type AS `合同类型`, COUNT(*) / (SELECT COUNT(*) FROM order_contract) * 100 AS `占比` FROM order_contract GROUP BY contract_type) ZOV_SUB_ALIAS_FOR_LIMIT LIMIT 91',
  ],
  chartLoading: false,
  askId: 86100248202752,
  visual: {
    translatedSql:
      'SELECT\n    合同类型 AS `合同类型`,\n    COUNT(*) / (SELECT\n        COUNT(*)\n    FROM\n        合同订单表) * 100 AS `占比`\nFROM\n    合同订单表\nGROUP BY\n    合同类型',
    displayType: 'PIE_CHART',
    session_id: 0,
    finalQuestion: '销售合同类型 占比分布情况',
    metrics: [
      {
        field: '占比',
        name: '占比',
      },
    ],
    finalSql:
      'SELECT\n    contract_type AS `合同类型`,\n    COUNT(*) / (SELECT\n        COUNT(*)\n    FROM\n        order_contract) * 100 AS `占比`\nFROM\n    order_contract\nGROUP BY\n    contract_type',
    title: '销售合同类型 占比分布情况',
    sql: 'SELECT contract_type AS `合同类型`, COUNT(*) / (SELECT COUNT(*) FROM order_contract) * 100 AS `占比` FROM order_contract GROUP BY contract_type',
    dimensions: [
      {
        field: '合同类型',
        name: '合同类型',
      },
    ],
  },
  id: 86100252497923,
  dsl: {
    data: [
      {
        合同类型: '开发服务',
        占比: 21.2121,
      },
      {
        合同类型: '行业解决方案类',
        占比: 39.3939,
      },
      {
        合同类型: '平台类',
        占比: 39.3939,
      },
    ],
    widgetID: 86100252497922,
    title: '销售合同类型 占比分布情况',
    type: 'PIE_CHART',
    angleField: '占比',
    colorField: '合同类型',
  },
  likeStomp: '0',
  status: 0,
};

export type RunningState = '' | 'Pending' | 'Rejected' | 'Fulfilled';

export const AIAction = {
  ZSKWD: '知识库问答',
  AITW: 'AI提问',
  SCQW: '生成全文',
  JXX: '继续写',
  SCTP: '生成图片',
  SCDG: '生成大纲',
  WYZJ: '网页总结',
  JJNR: '精简内容',
  SCZY: '生成摘要',
  FFNR: '丰富内容',
  BWRS: '帮我润色',
  SJZNT: '数据智能体',
};

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
      knowledge: string;
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
    console.log(markdown);
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
    Tenant: getTenant(),
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
  const {sid, docId, prompt, previous, model, knowledge} = args;
  const markdown = decodeMarkdown();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/fullText'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({type: 'fullText', articleId: docId, conversation_id: sid, prompt, model, knowledge, previous: previous || undefined}),
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
      throw e;
    }
  );
  return controller;
};

const chart: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {prompt, model} = args;
  const [robot_id, robotBizId] = model.split(',');
  request.post('/dream/pen/ChatBi/conversation', {appId: '0', robot_id, robotBizId, user_input: prompt}, {signal}).then(
    (res) => {
      const chart = res.data.data; //ansewerData;
      onMessage({
        html: JSON.stringify(chart),
        raw: '',
      });
      setTimeout(onDone);
    },
    (e) => {
      setTimeout(() => onError(e));
      throw e;
    }
  );
  return controller;
};

const stylize: AIRequest = ({args, onMessage, onError, onDone}) => {
  const controller = new AbortController();
  const {signal} = controller;
  const {sid, docId, prompt, model, context, previous, action} = args;
  const req: {
    url: string;
    body: {type: string; articleId: string; conversation_id: string; content: string; model: string; previous?: string; tone?: string};
  } = {
    url: '',
    body: {type: '', articleId: docId, conversation_id: sid, content: context, model, previous: previous || undefined},
  };
  if (action === AIAction.JJNR) {
    req.url = '/dream/pen/ai/writer/simplify';
    req.body.type = 'simplify';
  } else if (action === AIAction.SCZY) {
    req.url = '/dream/pen/ai/writer/excerpt';
    req.body.type = 'excerpt';
  } else if (action === AIAction.FFNR) {
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
  args: {articleId: string; content: string; contType: string; stand: string; knowledge: string},
  onMessage: (html: string) => void,
  onError: (e: any) => void,
  onDone: () => void
): AbortController {
  const controller = new AbortController();
  const {knowledge, content, stand, contType} = args;
  const html = decodeHtml();
  fetchEventSource(replaceBaseUrl('/dream/pen/ai/writer/verify'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({content, standpoint: stand, knowledge, contractType: contType}),
    signal: controller.signal,
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

function featchTplTag(
  field: string,
  args: {kind: string; source: string},
  title: string,
  context: string,
  onMessage: (field: string, html: string) => void
): {abort: () => void} {
  if (args.kind === 'date' || args.kind === 'sign') {
    request.post('/dream/pen/ai/template/static/plugin', {pluginType: args.source}).then((res) => {
      onMessage(field, res.data?.data || '???');
    });
    return {
      abort: () => {
        onMessage = () => undefined;
      },
    };
  } else if (args.kind === 'replace') {
    const source = args.source.slice(15, -3);
    const json = JSON.parse(decodeURI(source));
    setTimeout(() => onMessage(field, json.default));
    return {
      abort: () => {
        onMessage = () => undefined;
      },
    };
  } else {
    const controller = new AbortController();
    const {signal} = controller;
    const html = decodeHtml();
    fetchEventSource(replaceBaseUrl('/dream/pen/ai/template/plugin'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({pluginType: args.source, title, previousParagraph: context}),
      signal,
      openWhenHidden: true,
      onmessage: (ev) => onMessage(field, html(ev.data)),
      onerror: (e) => {
        throw e;
      },
    });
    return {
      abort: () => {
        onMessage = () => undefined;
        try {
          controller.abort();
        } catch (err) {
          console.error(err);
        }
      },
    };
  }
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
  chart,
  web,
  tpl,
  featchTplTag,
  getMyKnowledges(): Promise<{label: string; value: string}[]> {
    return request.get('/dream/pen/know/kb').then((res) => {
      return res.data.data.kbs.map((item: any) => ({label: item.name, value: item.id}));
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
  getMyChartBI(): Promise<{label: string; value: string}[]> {
    return request.get('/dream/pen/ChatBi/list').then((res) => {
      const list: any[] = res.data.data || [];
      return list.map((item) => ({label: item.robotName, value: [item.id, item.robotId].join(',')}));
    });
  },
};

export default AiAPI;
