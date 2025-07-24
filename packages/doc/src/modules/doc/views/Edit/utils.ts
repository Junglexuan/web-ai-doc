import {createEditor} from '@wangeditor-next/editor';

export interface AIEvent {
  key: string;
  pos: {x: number; y: number};
  context: string;
  content: string;
  // begin: HTMLElement;
  // end: HTMLElement;
  placeholder: HTMLElement;
}

export interface AIInputRef {
  getValue: () => string;
  focus: () => void;
}

export function dslToHtml(dsl: any): string {
  const arr = Array.isArray(dsl) ? dsl : [dsl];
  if (arr[0]) {
    const editor = createEditor({content: arr});
    return editor.getHtml();
  } else {
    return '';
  }
}

export function htmlToDsl(html: string): string {
  if (html) {
    const editor = createEditor({html});
    return JSON.stringify(editor.children);
  }
  return '';
}

export function replaceReviewItem(html: string, item: {long: string; source: string; target: string; type: string; reason: string}): string {
  const {source, target, long, reason} = item;
  const longReg = long.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`((<(?!\\/)[^>]+>)+)([^>]*${longReg}[^<]*)((<(?=\\/)[^>]+>)*)`, 'g'), (code, start, tag, text, end) => {
    const sourceReg = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    start = start
      .replace(/<(?!span|s|u|em|strong|sup|sub)[^>]+>/g, '')
      .replace(/<ul[^>]*>/, '')
      .replace(/<span data-w-e-type="review"/g, '<span');
    end = end.replace(/<\/(?!span|s|u|em|strong|sup|sub)[^>]+>/g, '').replace(/<\/ul>/, '');
    // console.log(start, text, end);
    const reviewData = encodeURIComponent(JSON.stringify({source, target, reason}));
    return code.replace(
      new RegExp(sourceReg, 'g'),
      `${end}<span data-w-e-type="review" data-review="${reviewData}">${start}${source}${end}</span>${start}`
    );
  });
}

export function proofreadHtml2(html: string, items: {index: number; corrected: string; original: string; type: string}[]): string {
  console.log(html);
  const itemsMap = items.reduce((obj, cur) => {
    obj[cur.index] = cur;
    return obj;
  }, {} as {[key: string]: {corrected: string; index: number; original: string; type: string}});
  const texts: string[] = [];
  const newHtml: string[] = [];
  const l = html.length;
  let k = 0;
  let isTag = false;
  for (let i = 0; i < l; i++) {
    let char = html[i];
    newHtml.push(char);
    if (char === '<') {
      isTag = true;
      continue;
    } else if (char === '>') {
      if (isTag) {
        isTag = false;
        continue;
      }
    }
    if (!isTag) {
      const item = itemsMap[k];
      if (item) {
        newHtml.pop();
        newHtml.push('<span>');
      }
      if (char === '&') {
        const t = html.substring(i, i + 4);
        if (t === '&lt;' || t === '&gt;') {
          char = t === '&lt;' ? '<' : '>';
          i += 3;
          newHtml.push(t.substring(1));
        }
      }
      if (item) {
        texts.push(item.original);
        newHtml.push(item.corrected + '</span>');
        i += item.original.length - 1;
        k += item.original.length - 1;
      } else {
        texts.push(char);
        k++;
      }
    }
  }
  console.log(texts.join(''));
  console.log(newHtml.join(''));
  return html;
}
const htmlEscape: {[key: string]: number} = {
  '&lt;': 1,
  '&gt;': 1,
  '&nbs': 1,
};
function checkHtmlEscape(html: string, i: number): [number, string, string] | undefined {
  let t = html.substring(i, i + 4);
  if (htmlEscape[t]) {
    if (t === '&lt;') {
      return [i + 3, t, '<'];
    }
    if (t === '&gt;') {
      return [i + 3, t, '>'];
    }

    t = html.substring(i, i + 6);
    if (t === '&nbsp;') {
      return [i + 5, t, ' '];
    }
  }
  return;
}

export function proofreadHtml(html: string, items: {index: number; corrected: string; original: string; type: string}[]): string {
  console.log(html);
  html = html.replace(/(<\/h\d>|<\/p>)/g, '\n$1');
  const itemsMap = items.reduce((obj, cur) => {
    obj[cur.index] = cur;
    return obj;
  }, {} as {[key: string]: {corrected: string; index: number; original: string; type: string}});

  const texts: string[] = [];
  const newHtml: string[] = [];
  const length = html.length;
  let k = 0;
  let i = 0;
  let o = 0;
  let x: string[] | undefined;
  let isTag = false;
  for (i; i < length; i++) {
    let char = html[i];
    let txt = char;
    if (char === '<') {
      isTag = true;
      newHtml.push(char);
      continue;
    } else if (char === '>') {
      if (isTag) {
        isTag = false;
        newHtml.push(char);
        continue;
      }
    }
    if (!isTag) {
      if (char === '&') {
        const arr = checkHtmlEscape(html, i);
        if (arr) {
          i = arr[0];
          char = arr[1];
          txt = arr[2];
        }
      }
      const item = itemsMap[k];
      if (item) {
        newHtml.push(`<span data-reason="${item.type}" data-target="${item.corrected}">`);
        o = item.original.length;
        x = [item.original];
        // texts.push(item.original);
        //newHtml.push('<span>' + item.corrected);
        // i += item.original.length - 1;
        // k += item.original.length - 1;
      }
      newHtml.push(char);
      texts.push(txt);
      if (o) {
        x!.push(txt);
        if (o === 1) {
          newHtml.push('</span>');
          const expected = x!.shift();
          const actual = x!.join('');
          if (expected !== actual) {
            console.warn(expected, '!==', actual);
          }
          x = undefined;
        }
        o--;
      }
      k++;
    } else {
      newHtml.push(char);
    }
  }
  console.log(texts.join(''));
  console.log(newHtml.join(''));
  return newHtml.join('');
}
// 12<34>  56
// '<p><span>ab1&lt;<span>cd1&gt; &nbsp;56</p>'
// proofreadHtml('<p>12&lt;34&gt; &nbsp;56</p>', [
//   {index: 0, original: '121', corrected: 'ab1', type: '尊称'},
//   {index: 3, original: '341', corrected: 'cd1', type: '尊称'},
// ]);

// const html = `<h1>一、农家小炒肉的做法概述</h1><p style="text-indent: 32pt;">一、农家小炒肉的魅力与制作要点</p><p style="text-indent: 32pt;">农家小炒肉作为一道经典的家常菜肴，凭借其简单易学的制作方法和令人垂涎的鲜美滋味，深受广大食客的喜爱。这道菜的关键在于选用新鲜的五花肉以及翠绿的青椒等主要配料，通过高温快炒的方式最大限度地保留了食材本身的原汁原味。在烹饪过程中，火候的掌控是决定成败的重要因素之一。既要确保肉质完全熟透，又要避免过高的温度导致肉片变得干硬无味。另外，调料的种类选择及其用量比例同样对最终成品的味道有着直接的影响，因此，在制作时需精心挑选优质调料并合理搭配，以达到最佳风味效果。接下来，我们将从选材、准备工作以及具体的烹饪步骤三个方面详细介绍如何制作一道地道可口的农家小炒肉。</p><p style="text-indent: 32pt;">二、选材与准备工作</p><p style="text-indent: 32pt;">要想做出一道正宗的农家小炒肉，首先必须重视原材料的选择。优质的五花肉是整道菜的灵魂所在，应选择肥瘦相间的部位，这样既能保证炒制时油脂充分释放，又能使肉片在入口时富有弹性且不油腻。同时，还需挑选新鲜饱满的青椒作为配菜，其鲜艳的颜色不仅能够提升菜品的视觉吸引力，还能增加菜肴的清新口感。除了主料之外，还需要准备适量的大蒜、生姜以及葱段等辅料来增添香气。在开始烹饪前，需要将五花肉切成薄厚均匀的片状，并用少许盐、生抽腌制片刻；青椒则要洗净去籽后切成条形备用。此外，提前调制好一碗酱汁也是必不可少的环节，通常包括生抽、老抽、糖、醋等多种调味品按一定比例混合而成，用来为后续炒制提供基础味道。</p><p style="text-indent: 32pt;">三、具体烹饪步骤</p><h1>二、选材与准备工作</h1><p>制作农家小炒肉的第一步是选材。优质的五花肉是成功的关键，建议选择带有适量肥瘦相间部分的部位，这样在烹饪过程中可以释放出丰富的油脂，使菜肴更加香浓。其次，青椒是不可或缺的配菜之一，它不仅为菜品增添了色彩，还提供了清脆爽口的口感。同时，根据个人口味可适当加入红辣椒增加辣度。另外，还需准备姜蒜末作为基础调味料。在准备工作方面，将五花肉切成薄片，青椒切丝备用，并确保所有材料都已清洗干净。此外，提前调制好酱汁也是节省时间的好办法，通常由生抽、老抽、糖、醋以及少量水混合而成。</p><p><br></p><h1>三、具体操作步骤</h1><p>1. 将切好的五花肉放入锅中干煸至微黄出油，这一过程能够去除多余脂肪并让肉片更紧实。当看到肉片边缘开始卷曲时即可盛出备用。接着，在同一锅内留底油，放入姜蒜末爆香，随后加入青椒翻炒均匀，直至青椒变软但仍保持一定脆感。2.此时将之前煸好的五花肉重新倒入锅中，与青椒一起快速翻炒，期间加入事先调好的酱汁，继续翻炒约两分钟，使每一片肉都能充分吸收酱汁的味道。3. 最后可根据喜好撒上少许葱花点缀提味，关火装盘即可上桌享用。整个烹饪过程大约只需十五分钟左右，非常适合忙碌的工作日家庭晚餐。</p><h1>四、技巧与注意事项</h1><p>为了达到最佳效果，在制作农家小炒肉时需要注意以下几点：首先，干煸五花肉时要控制好火候，避免过度煎炸导致肉质变得干硬；其次，翻炒时动作要迅速，以免食材过久受热影响口感；再次，酱汁的比例应根据个人口味灵活调整，喜欢咸鲜口味的可适当增加酱油用量，偏爱酸甜风味则可多加一点醋和糖。最后，如果家中有小孩或老人食用，建议减少辣椒用量或者不放辣椒，以适应不同人群的需求。遵循这些小贴士，相信每位厨艺爱好者都能轻松做出一道色香味俱佳的农家小炒肉！</p>`;

// proofreadHtml(html, []);
