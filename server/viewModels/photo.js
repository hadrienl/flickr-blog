var database = require('../../core/database'),
  q = require('q'),
  ViewModel = require('./view-model'),
  _ = require('lodash');

function Photo (data) {
  ViewModel.apply(this, arguments);

  Object.defineProperties(this, {
    orientation: {
      get: function () {
        if (this.width >= this.height) {
          return 'landscape';
        }
        return 'portrait';
      }
    },
    landscape: {
      get: function () {
        return this.orientation === 'landscape';
      }
    },
    portrait: {
      get: function () {
        return this.orientation === 'portrait';
      }
    }
  });
}

Photo.prototype.getSrc = function (size) {
  switch (size) {
    case 'sq':
      return this.url_sq;
    case 't':
      return this.url_t;
    case 's':
      return this.url_s;
    case 'm':
      return this.url_m;
    case 'm':
      return this.url_m;
    default:
      return this.url_o;
  }
};

module.exports = Photo;
