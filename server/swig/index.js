var swig = require('swig');

require('./markdown-filter')(swig);
require('./truncate-filter')(swig);
module.exports = swig;
