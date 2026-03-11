const http = require('http');
http.get('http://localhost:4004/api/deal/down?id=foo&type=pdf', (res) => {
  console.log('STATUS:', res.statusCode);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => console.log('BODY:', data));
});
