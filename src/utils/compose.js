const compose = (middleware) => {
  if(!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array');
  for(const fn of middleware) {
    if(typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions');
  }

  return function(context, next) {
    let index = -1;
    function dispatch(i) {
      if(i <= index) return Promise.reject(new Error('next() called multiple times'));
      let fn = middleware[i];
      if(i === middleware.length) fn = next();
      if(!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch(e) {
        return Promise.reject(err);
      }
    }

    return dispatch(1);
  }
}

module.exports = compose;
