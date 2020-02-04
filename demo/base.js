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

app.use(async (req, res) => {
  res.writeHead(200);
  res.end('Hello world')
});

app.listen(3001, ()=> {
  console.log('server start at 3001');
})