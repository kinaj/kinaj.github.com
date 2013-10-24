//
//  store - wrapper for localStorage with ttl
//
(function(window, undefined) {
  var defaultPrefix = 'store__',
      ttlPostfix    = '__ttl';

  function prefix(key) {
    return (window.store.prefix || defaultPrefix) + key;
  }
  function ttlKey(key) {
    return key + ttlPostfix;
  }
  function get(key) {
    var val = null,
        ttl = localStorage.getItem(prefix(ttlKey(key)));
    
    if (ttl && ttl < Date.now()) {
      localStorage.removeItem(prefix(key));
      localStorage.removeItem(prefix(ttlKey(key)));
    } else {
      val = localStorage.getItem(prefix(key));
      if (val) val = JSON.parse(val);
    }

    return val;
  }
  function set(key, val, ttl) {
    var val = JSON.stringify(val);

    localStorage.setItem(prefix(key), val);
    localStorage.setItem(prefix(ttlKey(key)), ttl + Date.now());
  }

  window.store = {get: get, set:set};
})(window);
