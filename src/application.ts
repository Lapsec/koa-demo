import { EventEmitter } from 'events';
import http from 'http';

interface Application {
  callbackFn: (req: object, res: object) => {};
}

class Application extends EventEmitter implements Application {
  constructor() {
    super();
    this.callbackFn = null;
  }

  use(fn: () => {}) {
    this.callbackFn = fn;
  }

  callback() {
    return (req: object, res: object) => {
      this.callbackFn(req, res);
    };
  }

  listen(...args: []) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
}

export default Application;
