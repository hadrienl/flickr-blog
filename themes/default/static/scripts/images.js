(function () {
'use strict';
document.body.className += ' js';

var images = document.querySelectorAll('span[data-src]'),
  sorted = {};

[].forEach.call(images, function (i) {
  var parent = i.parentNode,
    top = $(parent).offset().top - 200;
  if (!sorted[top]) {
    sorted[top] = [];
  }
  sorted[top].push(i);
});
window.addEventListener('scroll', function (e) {
  reveal(window.scrollY + window.innerHeight);
});

function reveal(bottom) {
  for (var i in sorted) {
    if (i < bottom) {
      sorted[i].forEach(createImg);
      delete sorted[i];
    }
  }
}

function createImg(span) {
  var img = new Image();

  img.setAttribute('src', span.dataset.src);
  img.setAttribute('title', span.dataset.title);
  img.setAttribute('alt', span.dataset.alt);
  span.parentNode.insertBefore(img, span);
  img.onload = function () {
    span.parentNode.className += ' displayed';
    span.remove();
  };
}

reveal(window.innerHeight);
})();
