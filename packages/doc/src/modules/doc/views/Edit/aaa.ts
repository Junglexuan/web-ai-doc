'<p><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">sdfsdf</span></p><p><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">农</span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;"><s><u><strong>家的做法，美丽得地球我</strong></u></s></span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">的家，为</span><span style="color: rgb(231, 95, 51); font-size: medium; font-family: -webkit-standard;"><u><strong>啊是粉色哒撒地方</strong></u></span></p>'.match(
  /(<[^/]*>)([^>]*做法，美丽得[^<]*)((<(?=\/)[^>]*>)+)/
);

'<p><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;"><s><u><strong>家的做法，美丽得地球我</strong></u></s></span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">的家，为</span><span style="color: rgb(231, 95, 51); font-size: medium; font-family: -webkit-standard;"><u><strong>啊是粉色哒撒地方</strong></u></span></p>'.match(
  /(<[^/]*>)([^>]*做法，美丽得[^<]*)((<(?=\/)[^>]*>)+)/
);

'<p><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">sdfsdf</span></p><p><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">农</span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;"><s><u><strong>家的做法，<cite>美丽</cite>得地球我</strong></u></s></span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">的家，为</span><span style="color: rgb(231, 95, 51); font-size: medium; font-family: -webkit-standard;"><u><strong>啊是粉色哒撒地方</strong></u></span></p>'.match(
  /([^>]*)(<cite>.+<\/cite>)([^<]*)/
);

'<ul><li>aaaaf<strong>dbbbs</strong>fsaaa</li><li>dddd<strong>adddf</strong>afsa</li></ul>'.replace(
  new RegExp(`((<(?!\\/)[^>]+>)+)([^>]*dbbbs[^<]*)((<(?=\\/)[^>]+>)+)`, 'g'),
  (code, tag, start, text, end) => {
    console.log(start);
    console.log(end);
  }
);
