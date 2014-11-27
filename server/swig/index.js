var swig = require('swig');

require('./markdown-filter')(swig);

module.exports = swig;
