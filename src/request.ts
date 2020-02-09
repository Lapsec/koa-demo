interface reqInterface {
  headers: object;
  url: string;
};
class Request {
  req: reqInterface;

  get header() {
    return this.req.headers;
  }

  set header(val) {
    this.req.headers = val;
  }

  get url() {
    return this.req.url;
  }

  set url(val) {
    this.req.url = val;
  }
}

export default Request;
