module.exports = function (swig) {
  swig.setFilter('truncate', function (string, len) {
    if (string.length <= len) {
      return string;
    }
    return string.substr(0,len) + '…';
  });
};
