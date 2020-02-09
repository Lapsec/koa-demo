// const http = require('http');

// const server = http.createServer((req, res) => {
//   res.writeHead(200);
//   res.end('hello world');
// })

// server.listen(3000, () => {
//   console.log('server start at 3000');
// });

const Koa = require('../lib/application').default;
const app = new Koa();

app.use(async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    code: 1,
    message: 'ok',
    url: ctx.url
  };
});

app.listen(3001, () => {
  console.log('server start at 3001');
});
