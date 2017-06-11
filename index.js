const initializeFramework = require('./lib');

module.exports = {
    'framework:stacktrace': ['factory', initializeFramework]
};