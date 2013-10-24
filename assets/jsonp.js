//
// JSONP lib
//
(function(window, undefined) {
  var head = document.getElementsByTagName('head')[0];

  var jsonp = {
    current: null,
    sucess: null,
    get: function(url, data, callback) {
      var script,
          src     = url + (url.indexOf('?')+1 ? '&' : '?'),
          params  = [];

      this.success = callback;

      data['callback'] = 'jsonp.success';
      for (var paramName in data) {
        params.push(paramName + '=' + encodeURIComponent(data[paramName]));
      }
      src += params.join('&');

      if (this.current) head.removeChild(this.current);

      script = document.createElement('script');
      script.setAttribute('src', src);
      script.setAttribute('type', 'text/javascript');
      head.appendChild(script);
    }
  };

  window.jsonp = jsonp;
})(window);
