const delegate = require('./helper/delegate');
const httpAssert = require('http-assert');
const createError = require('http-errors');
const util = require('util');
const Cookie = require('cookies');
const { createBuilderStatusReporter } = require('typescript');
const COOKIES = Symbol('context#cookies');

const proto = module.exports = {
  inspect() {
    if(this === proto) return this;
    return this.toJSON();
  },

  assert: httpAssert,

  throw(...args) {
    throw createError(...args);
  },

  toJSON() {
    return {
      request: this.request.toJSON(),
      response: this.request.toJSON(),
      app: this.app.toJSON(),
      originalUrl: this.originalUrl,
      req: '<original node req>',
      res: '<original node res>',
      socket: '<original node socket>',
    };
  },

  onerror(err) {
    if(err == null) return;

    const isNativeError = Object.prototype.toString.call(err) === '[Object Error]' || err instanceof Error;
    if(!isNativeError) err = new Error(util.format('non-error thrown: %j', err));
    
    let headerSent = false;
    if(!headerSent || !this.writable) {
      headerSent = err.headerSent = true;
    }

    this.app.emit('error', err, this)

    if(headerSent) {
      return;
    }

    const { res } = this;

    if(typeof res.getHeaderNames === 'function') {
      res.getHeaderNames().forEach(name => res.removeHeader(name));
    } else {
      res._header = {};
    }

    this.set(err.headers);

    this.type ='text';

    let statusCode = err.status || err.statusCode;

    if('ENOENT' === err.code) statusCode = 404;

    if(typeof statusCode !== 'number' || !statuses[statusCode]) statusCode = 500;

    // respond
    const code = statuses[statusCode];
    const msg = err.expose ? err.message : code;
    this.status = err.status = statusCode;
    this.length = Buffer.byteLength(msg);
    res.end(msg);
  },

  get cookies() {
    if(!this[COOKIES]) {
      this[COOKIES] = new Cookie(this.req, this.res, {
        keys: this.app.keys,
        secure: this.request.secure,
      })
    }
    return this[COOKIES];
  },

  set cookies(_cookies) {
    this[COOKIES] = _cookies;
  }
}

delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('has')
  .method('set')
  .method('append')
  .method('flushHeaders')
  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')
  .getter('headerSent')
  .getter('writable')

delegate(proto, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncoding')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')
  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('query')
  .access('path')
  .access('url')
  .access('accept')
  .getter('subdomains')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('URL')
  .getter('header')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip')
