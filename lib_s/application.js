const Emitter = require('events');
const request = require('./request');
const response = require('./response');
const context = require('./context');
const http = require('http');
const compose = require('./helper/compose');
const statuses = require('statuses');
const { HttpError } = require('http-errors');
const onFinished = require('on-finished');


class Application extends Emitter {
  constructor(options) {
    super();
    options = options || {};
    this.proxy = options.proxy || false;
    this.proxyIpHeader = options.proxyIpHeader || 'X-Forwarded-For';
    this.maxIpsCount = options.maxIpsCount || 0;
    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  use(fn) {
    if(typeof fn !== 'function') throw new TypeError('middleware must be a function!');

    this.middleware.push(fn);
    return this;
  }

  callback() {
    const fn = compose(this.middleware);
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    }

    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    server.listen(...args);
  }

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);

    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;

    request.ctx = response.ctx = context;
    request.response = response;

    response.request = request;
    context.originUrl = request.originUrl = req.url;
    context.state = {};
    return context;
  }

  onerror(err) {
    const isNativeError = Object.prototype.toString.call(err) === '[Object Error]' || err instanceof Error;
    if(!isNativeError) throw new TypeError(util.format('non-error thrown: %j', err));

    if(404 === err.status || err.expose) return;
    if(this.slient) return;

    const msg = err.stack || err.toString();
    console.log(`\n${msg.replace(/^/gm, ' ')}\n`);
   }
}


function respond(ctx) {
  if(ctx.respond === false) return;
  if(!ctx.writable) return;

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  if(status.empty[code]) {
    ctx.body = null;
    return res.end();
  }

  if('HEAD' === ctx.method) {
    if(!res.headerSend && !ctx.response.has('Content-Length')) {
      const { length } = ctx.response;
      if(Number.isInteger(length)) ctx.length = length;
    }
  }

  if(null == body) {
    if(ctx.response._explicitNullBody) {
      ctx.response.remove('Content-Type');
      ctx.response.remove('Transfer-Encoding');
      return res.end();
    }

    if(ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }

    if(!res.headerSend) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  if(Buffer.isBuffer(body) || typeof body === 'string') return res.end(body);
  if(body instanceof Stream) return body.pipe(res);

  body = JSON.stringify(body);
  if(!res.headerSend) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);

}

module.exports = Application;