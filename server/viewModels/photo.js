var database = require('../../core/database'),
  q = require('q'),
  ViewModel = require('./view-model');

function Photo (data) {
  ViewModel.apply(this, arguments);
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
