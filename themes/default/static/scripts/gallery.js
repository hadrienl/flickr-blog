(function(element) {
'use strict';
  var gallery;

  element.setAttribute('data-pswp-uid', 1);
  element.onclick = onThumbnailsClick;

  // Parse URL and open gallery if it contains #&pid=3&gid=1
  var hashData = photoswipeParseHash();
  if(hashData.pid > 0) {
    openPhotoSwipe( hashData.pid - 1 ,  element, true );
  }

  // parse slide data (url, title, size ...) from DOM elements (links)
  function parseThumbnailElements(el) {
    var thumbElements = el.getElementsByTagName('a'),
      numNodes = thumbElements.length,
      items = [],
      childElements,
      thumbnailEl,
      size,
      item;

    for(var i = 0; i < numNodes; i++) {
      el = thumbElements[i];

      // include only element nodes 
      if(el.nodeType !== 1) {
        continue;
      }

      childElements = el.children;

      size = el.getAttribute('data-size').split('x');

      // create slide object
      var o_w = parseInt(size[0], 10),
        o_h = parseInt(size[1], 10),
        w, h;

      if (navigator.userAgent.toLowerCase().match('mobile')) {
        if (o_w > o_h) {
          w = 500;
          h = w / o_w * o_h;
        } else {
          h = 500;
          w = h * o_w / o_h;
        }
        item = {
          src: el.dataset.srcMedium,
          w: w,
          h: h
        };
      } else {
        item = {
          src: el.dataset.src,
          w: o_w,
          h: o_h
        };
      }

      item.title = el.parentNode.getElementsByTagName('figcaption')[0].innerText;
      item.el = el; // save link to element for getThumbBoundsFn

      items.push(item);
    }

    return items;
  }

  // find nearest parent element
  function closest(el, fn) {
    return el && ( fn(el) ? el : closest(el.parentNode, fn) );
  }

  // triggers when user clicks on thumbnail
  function onThumbnailsClick(e) {
    e = e || window.event;
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }

    var eTarget = e.target || e.srcElement;

    var clickedListItem = closest(eTarget, function(el) {
      return el.tagName === 'A';
    });

    if(!clickedListItem) {
      return;
    }

    var childNodes = element.getElementsByTagName('a'),
      numChildNodes = childNodes.length,
      nodeIndex = 0,
      index;

    for (var i = 0; i < numChildNodes; i++) {
      if(childNodes[i].nodeType !== 1) { 
        continue; 
      }

      if(childNodes[i] === clickedListItem) {
        index = nodeIndex;
        break;
      }
      nodeIndex++;
    }

    if(index >= 0) {
      openPhotoSwipe( index, element );
    }
    return false;
  }

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  function photoswipeParseHash() {
    var hash = window.location.hash.substring(1),
    params = {};

    if(hash.length < 5) {
      return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
      if(!vars[i]) {
        continue;
      }
      var pair = vars[i].split('=');  
      if(pair.length < 2) {
        continue;
      }       
      params[pair[0]] = pair[1];
    }

    if(params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    if(!params.hasOwnProperty('pid')) {
      return params;
    }
    params.pid = parseInt(params.pid, 10);
    return params;
  }

  function openPhotoSwipe(index, galleryElement, disableAnimation) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
      options,
      items;

    items = parseThumbnailElements(galleryElement);

    // define options (if needed)
    options = {
      index: index,

      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

      getThumbBoundsFn: function(index) {
        // See Options -> getThumbBoundsFn section of docs for more info
        var thumbnail = items[index].el.children[0],
          pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect(); 

        return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
      }

    };

    if(disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
  }

  window.addEventListener('keydown', function (e) {
    try {
      if (39 === e.keyCode) {
        return gallery.next();
      }
      if (37 === e.keyCode) {
        return gallery.prev();
      }
    } catch (err) {}
  });
})(document.getElementById('gallery'));
