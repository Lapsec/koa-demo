import { EventEmitter } from 'events';
import http from 'http';
const context = require('./context');
const request = require('./request');
const response = require('./response');
const compose  = require('./utils/compose');
interface Application {
  callbackFn: any;
  context: typeof context;
  request: typeof request;
  response: typeof response;
  middleware: any;
}

class Application extends EventEmitter implements Application {
  constructor() {
    super();
    this.callbackFn = null;
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    this.middleware = [];
  }

  use(fn:any) {
    this.middleware.push(fn); // 存储中间件
  }

  callback() {
    // 合成所有中间件
    const fn = compose(this.middleware);
    const handleRequest = (req:object, res: object) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn)
    };

    return handleRequest;
  }

  handleRequest(ctx: any, fnMiddleware: any) {
    const handleResponse = () => respond(ctx);
    const onerror = (err: any) => ctx.onerror(err);
    // 执行中间件并把最后的结果交给respond
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  createContext(req: any, res: any) {
    let ctx = Object.create(this.context);
    ctx.request = Object.create(this.request);
    ctx.response = Object.create(this.response);
    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;
    ctx.app = ctx.request.app = ctx.response.app = this;
    return ctx;
  }

  listen(...args: any) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
}

function respond(ctx: any) {
  // 根据ctx.body的类型，返回最后的数据
  /* 可能的类型，代码删减了部分判断
  1. string
  2. Buffer
  3. Stream
  4. Object
  */
  let content = ctx.body;
  if (typeof content === 'string') {
    ctx.res.end(content);
  }
  else if (typeof content === 'object') {
    ctx.res.end(JSON.stringify(content));
  }
}

export default Application;
