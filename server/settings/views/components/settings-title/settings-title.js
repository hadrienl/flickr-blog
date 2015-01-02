'use strict';
Polymer({
  ready: function () {
    var self = this;
    window.addEventListener('popstate', function (e) {
      self.label = getTitle(window.location.pathname);
    });
    self.label = getTitle(window.location.pathname);
  }
});

function getTitle (path) {
  var title = '';
  switch (path) {
    case '/settings/':
      title = 'Main settings';
      break;
    case '/settings/content.html':
      title = 'Content settings';
      break;
    case '/settings/design.html':
      title = 'Design settings';
      break;
  }
  return title;
}
