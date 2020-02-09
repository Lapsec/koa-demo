interface resInterface {
  statusCode: number;
  headers: object;
  url: string;
};
class Response {
  res: resInterface;
  _body: object;

  get status() {
    return this.res.statusCode;
  }

  set status(code: number) {
    this.res.statusCode = code;
  }

  get body() {
    return this._body;
  }

  set body(val) {
    // 源码里有对val类型的各种判断，这里省略
    /* 可能的类型
    1. string
    2. Buffer
    3. Stream
    4. Object
    */
    this._body = val;
  }

}

export default Response;
