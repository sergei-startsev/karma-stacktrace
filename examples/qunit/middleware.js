const os = require('os');
const path = require('path');
const serveStatic = require('serve-static');

// path is hardcoded in karma-webpack
// https://github.com/webpack-contrib/karma-webpack/blob/2f47250255ca903ae96dcc8fddca0a59c82cdd5a/src/karma-webpack.js#L93
const sourcePath = path.join(os.tmpdir(), '_karma_webpack_');
module.exports = function SourcesMiddleware() {
  return serveStatic(sourcePath);
};
