(function(window, undefined) {
  var res,
      aTimeout      = 3500,
      count         = 0,
      current       = 2,
      expires       = 3600*1000,
      page          = 1,
      perPage       = 30,
      shots         = [],
      shotSelector  = '.shot',
      showClass     = 'show',
      url           = 'http://api.dribbble.com/players/janik/shots';

  var $body   = document.querySelector('body'),
      $shots  = document.querySelector('#shots');

  function append(shot, cb) {
    var $a, $img, $div;

    $img  = dom.createElement('img',  { 'alt': shot.title, 'src': shot.image_url, 'title': 'View on dribbble: ' + shot.title });
    $a    = dom.createElement('a',    { 'href': shot.url, 'title': 'View on dribbble: ' + shot.title }, $img);
    $div  = dom.createElement('div',  { 'class': 'shot' }, $a);

    if (cb) {
      $img.addEventListener('load', function() { cb($div); }, false);
    }

    $shots.insertBefore($div, $shots.firstChild);
  }
  function callback(res) {
    preload(res.shots);
    page += 1;
    if (page <= res.pages) {
      getPage();
    }
  }
  function getPage(key) {
    var res,
        key     = 'dribbble:page:' + page,
        params  = { page: page, per_page: perPage };

    if (res = store.get(key)) {
      callback(res);
    } else {
      jsonp.get(url, params, function(res) {
        store.set(key, res, expires);
        callback(res);
      });
    }
  }
  function preload(list) {
    list.forEach(function(shot, idx) {
      var $img = dom.createElement('img', { 'src': shot.image_url });

      $img.style.setProperty('display', 'none');
      $img.addEventListener('load', function() {
        shots.push(shot);
        count++;
        $body.removeChild($img);

        if (count === 1) {
          append(shot, function($div) {
            var cb = function() {
              if ($div.previousElementSibling) {
                dom.addClass($div.previousElementSibling, showClass);
              }
            };

            $div.addEventListener('transitionend', cb, false);
            $div.addEventListener('webkitTransitionEnd', cb, false);
            setTimeout(function() {
              dom.addClass($div, showClass);
            }, 0);
          });
        }
        if (count === 2) {
          append(shot);
          setTimeout(rotate, aTimeout);
        }
      });
      $body.appendChild($img);
    });
  }
  function rotate() {
    var cb,
        $toHide = $shots.querySelectorAll(shotSelector)[1];

    append(shots[current++], function($div) { dom.addClass($div, showClass); });

    cb = function() {
      setTimeout(rotate, aTimeout);
      $shots.removeChild($toHide);
    };

    $toHide.addEventListener('transitionend', cb, false);
    $toHide.addEventListener('webkitTransitionEnd', cb, false);
    dom.removeClass($toHide, showClass);

    if (current >= count) current = 0;
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.removeEventListener('DOMContentLoaded', arguments.callee, false);
    getPage();
  }, false);
})(window);
