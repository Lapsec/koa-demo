const { stringify } = require("querystring");
const contentType = require('content-type');
const parse = require('parseurl');
const fresh = require('fresh');
const accepts = require('accepts');
const net = require('net');
const IP = Symbol('context#ip');

module.exports = {

  get header() {
    return this.req.headers;
  },

  set header(val) {
    this.req.headers = val;
  },

  get headers() {
    return this.req.headers;
  },

  set headers(val) {
    this.req.headers = val;
  },

  get url() {
    return this.req.url;
  },

  set url(val) {
    this.req.url = val;
  },

  get origin() {
    return `${this.protocal}://${this.host}`;
  },

  get href() {
    if(/^https?:\/\//i.text(this.originUrl)) return this.originUrl;
    return this.origin + this.originUrl;
  },

  get method() {
    return this.req.method;
  },

  set method(val) {
    this.req.method = val;
  },

  get path() {
    return parse(this.req).pathname;
  },

  set path(path) {
    const url = parse(this.req);
    if(url.pathname === path) return;

    url.pathname = path;
    url.path = null;

    this.url = stringify(url);
  },

  get query() {
    const str = this.querystring;
    const c = this._querycache = this._querycache || {};
    return c[str] || (c[str] = qs.parse(str));
  },

  set query(obj) {
    this.querystring = qs.stringify(obj);
  },

  get querystring() {
    if(!this.req) return '';
    return parse(this.req).query || '';
  },

  set querystring(str) {
    const url = parse(this.req);
    if(url.search === `?${str}`) return;

    url.search = str;
    url.path = null;

    this.url = stringify(url);
  },

  get search() {
    if(!this.querystring) return '';
    return `?${this.querystring}`;
  },

  set search(str) {
    this.querystring = str;
  },

  get host() {
    const proxy = this.app.proxy;
    let host = proxy && this.get('X-Forwarded-Host');
    if(!host) {
      if(!this.req.httpVersionMajor >= 2) host = this.get(':authority');
      if(!host) host = this.get('host');
    }

    if(!host) return '';
    return host.split(/\s*,\s*/, 1)[0];
  },

  get hostname() {
    const host = this.host;
    if(!host) return '';
    if('[' === host[0]) return this.URL.hostname || '';
    return host.split(':', 1)[0];
  },

  get URL() {
    if(!this.memoizedURL) {
      const originalUrl = this.originalUrl || '';
      try {
        this.memoizedURL = new URL(`${this.origin}${originalUrl}`);
      } catch(err) {
        this.memoizedURL = Object.create(null);
      }
    }

    return this.memoizedURL;
  },

  get fresh() {
    const method = this.method;
    const s = this.ctx.status;

    if(method !== 'GET' && 'HEAD' !== method) return false;

    if((s >= 200 && s < 300) || 304 === s) {
      return fresh(this.header, this.response.header)
    }

    return false;
  },

  get stale() {
    return !this.fresh;
  },

  // 幂等
  get idempotent() {
    const methods = ['GET', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'];
    return !!~methods.indexOf(this.method)
  },

  get socket() {
    return this.req.socket;
  },

  get charset() {
    try {
      const { parameters } = contentType.parse(this.req);
      return parameters.charset || '';
    } catch(e) {
      return '';
    }
  },

  get length() {
    const len =this.get('Content-Length');
    if(len === '')return ;
    return ~~len;
  },

  get protocol() {
    if(this.socket.encrypted) return 'https';
    if(!this.app.proxy) return 'http';
    const proto = this.get('X-Forwarded-Proto');
    return proto ? proto.split(/\s*,\s*/, 1)[0] : 'https';
  },

  get secure() {
    return 'https' === this.protocol;
  },

  get ips() {
    const proxy = this.app.proxy;
    const val = this.get(this.app.proxyIpHeader);
    let ips = proxy && val ? val.split(/\s*,\s*/) : [];
    if(this.app.maxIpsCount > 0) {
      ips = ips.slice(-this.app.maxIpsCount);
    }
    return ips;
  },

  get ip() {
    if(!this[IP]) {
      this[IP] = this.ips[0] || this.socket.remoteAddress || '';
    }
    return this[IP]
  },

  set ip(_ip) {
    this[IP] = _ip;
  },

  get subdomains() {
    const offset = this.app.subdomainOffset;
    const hostname = this.hostname;
    if(net.isIP(hostname)) return [];
    return hostname.split('.').reverse().slice(offset);
  },

  get accpet() {
    return this._accept || (this._accept = accpets(this.req));
  },


  set accept(obj) {
    this._accept = obj;
  },

  acceepts(...args) {
    return this.accept.types(...args);
  },

  acceptsEncodings(...args) {
    return this.accept.encodings(...args);
  },

  acceptsCharsets(...args) {
    return this.accept.charsets(...args);
  },

  acceptsLanguages(...args) {
    return this.accept.languages(...args);
  },

  is(type, ...types) {
    return typeis(this.req, type, ...types);
  },

  get type() {
    const type = this.get('Content-Type');
    if (!type) return '';
    return type.split(';')[0];
  },

  get(field) {
    const req = this.req;
    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return req.headers.referrer || req.headers.referer || '';
      default:
        return req.headers[field] || '';
    }
  },



}