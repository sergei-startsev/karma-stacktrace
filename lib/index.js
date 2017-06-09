const path = require('path');
const FRAMEWORK_NAME = 'humanity-stack';

module.exports = function initializeFramework(
    /* config.files */ files,
    logger
) {
    const log = logger.create(FRAMEWORK_NAME);
    log.debug('Framework initialization...');

    log.debug('Adding required resources to karma files list...');
    //push bundle and its map to files list
    var stacktracejs = path.dirname(require.resolve('stacktrace-js')) + '/dist/stacktrace-with-promises-and-json-polyfills.min.js';
    files.push(createPattern({ pattern: stacktracejs }));
    files.push(createPattern({ pattern: stacktracejs + '.map', included: false }));
};

function createPattern(options) {
    return Object.assign({}, {
        included: true,
        served: true,
        watched: false
    }, options);
}