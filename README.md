# flickr-blog

A blog with just a Flickr account

## Configuration

Copy the `config.json.dist` file and edit its content :

 * url : the public url of your blog. It's used by the flickr oAuth callback.
 * server.host, server.port : the host and port the server is listening. If you run your server behind a front server like nginx, you'll listen to localhost and a port over 1024, but the public url will be listened by nginx.
 * flickr.* : Flickr API config. You'll find it on [your Flickr account](https://www.flickr.com/services/api/keys/).

## Usage

`npm start`

This will install all node dependancies, install default theme submodule, install its bower dependancies, and finally start the server. You may now go to http://localhost:3000. A message will tell you to go to /settings then, you will login with your flickr account. The first account logged will be the only account to access the admin and to be crawled, so be carefull if you set your site public before configuring it.

When you are logged in, you see the settings form in where you can choose the blog url and your photosets collection. When you have saved your settings, your collection will start to be fetched and a message will tell you when your blog will be filled. Then you can start browsing it.

## Themes

Themes are located in `themes` folder. You can create a new theme by creating a new folder or `git submodule add` a project.

This folder **must** have :

* a folder called `views` with the files :
 * `home.html` : the blog home page (/, /page-2, etc)
 * `photoset.html` : the photosets pages (/2014/29/my-photoset.html)
 * `error.html` : the error page

This pages are in [twig format](https://paularmstrong.github.io/swig/) and should inherit of an index.html file.

This folder *should* have :

* a folder called `static` which will contains all static files and will be accessible on /*. For example, a ``static/styles/styles.css` will be served on `/styles/styles.css`. Don't use same slug format as your photosets.
* `package.json` file, created with `npm init` command. It will be used to display name and descrition of the theme in settings page. It's obviously mandatory if you use npm packages in your index.js file.
* `bower.json` if you use bower. You'll have to set a `.bowerrc` file to set the components directory as `static` folder : `"directory": "static/components"`.
* `index.js` : will expose a `home(data)` and a `photoset(data)` functions be executed on respectives routes with `data` object which is the data fetched and passed to the view template. Objects in this data are viewModels and expose some useful methods. For example, PhotoSet object expose a `photoset.getNewerPhotoset()` method which return the newer photoset directly after the current one and help creating paginations.
