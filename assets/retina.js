// Your stuff ===============================================================

var config = {
       path: "assets/images/",
     images: "scrivener sonny ios macnn scapple sencha madco cpp",
  extension: "png"
},

// ==========================================================================



files = config.images.split(" "),
i = files.length

if (devicePixelRatio > 1)
  while (i--) files[i] += "_2x";

[].forEach.call(document.querySelectorAll("img"), function(el, i) {
  el.src = config.path + files[i] + "." + config.extension
})