const delegate = require('./utils/delegate');
// import delegate from './utils/delegate';

const proto = module.exports = {
  toJSON () {
    return {
      request: this.request.toJSON(),
      response: this.response.toJSON(),
      app: this.app.toJSON(),
      originalUrl: this.originalUrl,
      req: '<original node req>',
      res: '<original node res>',
      socket: '<original node socket>'
    }
  },

  // context自身的方法
  onerror(err:any) {
    // 中间件报错捕获
    const { res } = this;

    if ('ENOENT' == err.code) {
      err.status = 404;
    } else {
      err.status = 500;
    }
    this.status = err.status;

    // 触发error事件
    this.app.emit('error', err, this);

    res.end(err.message || 'Internal error');
  }
}

delegate(proto, 'response')
  .access('status')
  .access('body');

  delegate(proto, 'request')
  .access('url')
  .access('header');
