(function(window, document, undefined) {
  document.addEventListener("DOMContentLoaded", function() {
    document.removeEventListener("DOMContentLoaded", arguments.callee, false);

    var mem = "";
    var links = {
      "email": "VIA EMAIL",
      "dribbble": "ON DRIBBBLE",
      "twitter": "ON TWITTER"
    };

    Object.keys(links).forEach(function(key) {
      var el = document.getElementsByClassName(key)[0];

      el.addEventListener("mouseover", function(event) {
        mem = this.innerHTML;
        this.innerHTML = links[key];
      });
      el.addEventListener("mouseout", function(event) {
        this.innerHTML = mem;
      });
    });
  });
})(window, document);
