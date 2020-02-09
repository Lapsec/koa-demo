import { EventEmitter } from 'events';
import http from 'http';
const context = require('./context');
const request = require('./request');
const response = require('./response');
interface Application {
  callbackFn: (req: object, res: object) => {};
  context: typeof context;
  request: typeof request;
  response: typeof response;
}

class Application extends EventEmitter implements Application {
  constructor() {
    super();
    this.callbackFn = null;
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  use(fn: () => {}) {
    this.callbackFn = fn;
  }

  callback() {
    const handleRequest = (req: any, res: any) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx);
    }
    return handleRequest;
  }

  handleRequest(ctx: any) {
    const handleResponse = () => response(ctx);
  }

  createContext(req: any, res: any) {
    let ctx = Object.create(this.context);
    ctx.request = Object.create(this.request);
    ctx.response = Object.create(this.response);
    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;
    ctx.app = ctx.request.app = ctx.response.app = this;
    return this;
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
