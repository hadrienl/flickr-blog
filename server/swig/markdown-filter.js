var marked = require('marked');

module.exports = function (swig) {
  swig.setFilter('markdown', function (input) {
    return marked(input);
  });
};
