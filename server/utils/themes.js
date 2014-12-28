var fs = require('fs'),
  q = require('q'),
  path = __dirname + '/../../themes/',
  themes;

module.exports = {
  getThemes: getThemes
};

function getThemes () {
  var deferred = q.defer();

  if (themes !== undefined) {
    deferred.resolve(themes);
    return deferred.promise;
  }

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
      themes = dirs.map(function (dir) {
        var data = readTheme(dir.filename);
        data.name = dir.filename;
        return data;
      });
      deferred.resolve(themes);
    })
    .catch (function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

function readTheme (theme) {
  try {
    var infos = require(path + theme + '/package.json');
    return {
      name: infos.name,
      description: infos.description,
      version: infos.version,
      author: infos.author
    };
  } catch (err) {
    return {};
  }
}
