//
//  dom - client-side DOM wrapper
//
(function(window, undefined) {
  var dom = {};
  window.requestAnimationFrame =
      window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame;

  var KEY = {
      BACKSPACE: 8,
      TAB:       9,
      RETURN:   13,
      ESC:      27,
      SPACE:    32,
      LEFT:     37,
      UP:       38,
      RIGHT:    39,
      DOWN:     40,
  };

  // GLOBAL FUNCTIONS

  function rgba(r, g, b, a) {
      return 'rgba(' + [r, g, b, a].join(',') + ')';
  }

  var $ = function (nodeList) {
      return Array.prototype.slice.call(nodeList, 0);
  };

  // GENERIC HELPERS

  dom.createElement = function (name, attrs, html) {
      var e = document.createElement(name);

      for (var a in (attrs || {})) {
          e.setAttribute(a, attrs[a]);
      }
      if (html) {
          if (typeof(html) === 'string') {
              e.innerHTML = html;
          } else {
              e.appendChild(html);
          }
      }
      return e;
  };

  dom.getPosition = function (e) {
      var left = 0, top = 0;

      while (e.offsetParent) {
          left += e.offsetLeft;
          top  += e.offsetTop;
          e     = e.offsetParent;
      }

      left += e.offsetLeft;
      top  += e.offsetTop;

      return { x: left, y: top };
  };

  // CLASS HELPERS

  dom.addClass = function (elem, name) {
    var cls = elem.className.split(' ');

    if (cls.indexOf(name) === -1) cls.push(name);

    elem.className = cls.join(' ');
  };

  dom.removeClass = function (elem, name) {
    var idx,
        cls = elem.className.split(' ');

    if ((idx = cls.indexOf(name)) !== -1) {
      cls.splice(idx, 1);
    }

    elem.className = cls.join(' ');
  };

  // ANIMATION BEHAVIOURS

  dom.animate = function (elem, style, target, duration, profile, callback) {
      var textval = elem.style.getPropertyValue(style) || '0px';
      var from = parseInt(textval);
      var unit = textval.replace(String(from), '');
      var animation = new(dom.Animation)(from, target, duration, profile);

      return animation.start(function (value) {
          elem.style.setProperty(style, String(value) + unit);
      }, function () {
          callback.apply(elem);
      });
  };

  dom.Animation = function Animation(from, to, duration, profile) {
      this.from     = from;
      this.to       = to;
      this.duration = duration;
      this.ontick   = null;
      this.onfinish = null;  // Completion callback
      this.profile  = profile;
      this.sign     = from > to ? -1 : 1;
      this.stopped  = false;
  };

  dom.Animation.prototype.tick = function () {
      if (this.paused)
          return;

      var now = Date.now();

      var elapsed   = Math.min(now - this.start, this.duration);
      var fraction  = elapsed / this.duration;

      if (this.profile === 'easeIn') {
          fraction = fraction - Math.sin(fraction * Math.PI * 2) / (Math.PI * 2);
      }

      var delta   = Math.abs(this.from - this.to) * fraction;
      var current = this.from + delta * this.sign;

      this.ontick(current);

      if (elapsed >= this.duration) {
          return this.stop();
      }
      window.requestAnimationFrame(arguments.callee.bind(this));
  };

  dom.Animation.prototype.start = function (ontick, onfinish) {
      this.start    = Date.now();
      this.ontick   = ontick;
      this.onfinish = onfinish;
      window.requestAnimationFrame(this.tick.bind(this));
      return this;
  };

  dom.Animation.prototype.stop = function (ontick, onfinish) {
      this.onfinish();
      this.stopped = true;
  };

  dom.Animation.prototype.pause = function () {
      this.paused = Date.now();
  };

  dom.Animation.prototype.resume = function () {
      if (this.stopped) {
          return;
      }
      var elapsed = Date.now() - this.paused;
      this.paused = false;
      this.start += elapsed;
      window.requestAnimationFrame(this.tick.bind(this));
  };

  // DRAG BEHAVIOURS

  dom.dragging = {
      origin:  null,
      element: null,
      offset:  null,
      index:   null,
      target:  null,
      zones:   []
  };

  dom.sorting = {
      element:   null,
      count:     null,
      positions: []
  };

  dom.setupDropZones = function () {
      var dropzones = document.querySelectorAll('.drop-zone');

      $(dropzones).forEach(function (z) {
          // ...
          dom.dragging.zones.push(z);
      });
  };

  dom.draggable = function (elem, options) {
      if (dom.zones == null) {
          dom.setupDropZones();
      }
      elem.ondragstart = elem.ondragstart || function () {};
      elem.onmousedown = function (e) {
          dom.dragging.origin = this;
          return false;
      };
  };

  document.onmouseup = function () {
      if (dom.dragging.element) {
          dom.dragging.element.classList.remove('dragging');

          if (dom.dragging.over) {
              dom.dragging.over.ondrop.call(dom.dragging.over, dom.dragging.element, dom.dragging.target);
          } else {
              dom.dragging.element.parentNode.removeChild(dom.dragging.element);
              dom.dragging.target.removeAttribute('style');
              dom.dragging.target.classList.remove('ghost');
          }
          dom.dragging.element = null;
          dom.dragging.offset  = null;
          dom.dragging.origin.ondragstop();
          dom.dragging.origin  = null;
      } else if (dom.dragging.origin) {
          dom.dragging.origin = null;
      }
  };

  document.onmousemove = function (e) {
      if (! dom.dragging.origin)
          return true;

      if (! dom.dragging.element) {
          return (function () {
              var source = e.srcElement || e.target;

              if (source.nodeName === 'LI' || source.nodeName === 'DIV') {
                  while (source !== this) {
                      if (source === document.body) { return true }
                      else                          { source = source.parentNode }
                  }
              } else {
                  return true;
              }
              var pos   = dom.getPosition(this);
              var clone = this.cloneNode(true);

              this.parentNode.insertBefore(clone, this);

              this.classList.add('ghost');
              clone.classList.add('dragging');

              dom.dragging.offset  = { x: e.pageX - pos.x, y: e.pageY - pos.y };
              dom.dragging.element = clone;
              dom.dragging.target  = this;
              dom.dragging.origin  = this;

              document.onmousemove(e);

              this.ondragstart.call(this);
          }).call(dom.dragging.origin);
      } else {
          var offset, element, list, position, prev, next;

          dom.mouse = { x: e.pageX, y: e.pageY };

          dom.dragging.element.style.top  = (dom.mouse.y - dom.dragging.offset.y) + 'px';
          dom.dragging.element.style.left = (dom.mouse.x - dom.dragging.offset.x) + 'px';

          var x = dom.mouse.x,
              y = dom.mouse.y;

          dom.dragging.zones.forEach(function (z) {
              var p = dom.getPosition(z),
                  h = z.offsetHeight,
                  w = z.offsetWidth;

              if (x > p.x && x < p.x + w &&
                  y > p.y && y < p.y + h) {
                  dom.dragging.over = z;
                  z.ondragover.call(z, e);
              } else {
                  dom.dragging.over = null;
                  z.ondragout.call(z, e);
              }
          });
      }
      return false;
  };

  window.dom = dom;
})(window);
