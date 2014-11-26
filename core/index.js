var client;

function update () {
  client.executeAPIRequest('flickr.photos.search', {
    text: "soccer",
    media: "photos",
    per_page: 25,
    page: 1,
    extras: "url_q, url_z, url_b, owner_name"
  }, false, function (error, result) {
    console.log(error, result);
  });
}

module.exports = {
  init: function () {
    client = require('./flickr');
  },
  update: update
};
