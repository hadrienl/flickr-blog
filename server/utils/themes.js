var fs = require('fs'),
  q = require('q');

module.exports = {
  getThemes: getThemes
};

function getThemes () {
  var deferred = q.defer(),
    path = __dirname + '/../../themes/';

  q.nfcall(fs.readdir, path)
    .then(function (data) {
      return q.all(data.map(function (filename) {
        return q.nfcall(fs.stat, path + filename)
          .then(function (stat) {
            stat.filename = filename;
            return stat;
          });
      }));
    })
    .then(function (data) {
      var dirs = data.filter(function (stat) {
        return stat.isDirectory();
      });
      deferred.resolve(dirs.map(function (dir) {
        return dir.filename;
      }));
    })
    .catch (function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}
