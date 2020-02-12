const Koa = require('../lib/application').default;
const app = new Koa();

// app.use(async (ctx) => {
//   // 报错可以捕获
//   a.b.c = 1;
//   ctx.body = 'hello tc';
// });

app.use(async (ctx, next) => {
  console.log('1-start');
  await next();
  console.log('1-end');
})

app.use(async (ctx) => {
  console.log('2-start');
  ctx.body = 'hello tc';
  console.log('2-end');
});


app.listen(3001, () => {
  console.log('server start at 3001');
});