var config = require('../config.json'),
  flickr = new (require('flickr').Flickr)(
  config.API_KEY,
  config.CONSUMER_SECRET,
  {
    "oauth_token": config.OAUTH_TOKEN,
    "oauth_token_secret": config.OAUTH_TOKEN_SECRET
  }
);

module.exports = flickr;
