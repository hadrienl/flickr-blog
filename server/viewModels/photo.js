var database = require('../../core/database'),
  q = require('q'),
  ViewModel = require('./view-model');

function Photo (data) {
  ViewModel.apply(this, arguments);
}

module.exports = Photo;
