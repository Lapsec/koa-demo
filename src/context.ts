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
  }
}

delegate(proto, 'response')
  .access('status')
  .access('body');

  delegate(proto, 'request')
  .access('url')
  .access('header');
