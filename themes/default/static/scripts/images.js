(function () {
'use strict';
document.body.className += ' js';

var container = document.querySelector('.main-section'),
  images = document.querySelectorAll('span[data-src]'),
  sorted = {};

[].forEach.call(images, function (i) {
  var parent = i.parentNode,
    top = $(parent).offset().top - 200;
  if (!sorted[top]) {
    sorted[top] = [];
  }
  sorted[top].push(i);
});
container.addEventListener('scroll', function (e) {
  reveal(e.target.scrollTop + window.innerHeight);
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
  console.log(span.dataset.src);
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