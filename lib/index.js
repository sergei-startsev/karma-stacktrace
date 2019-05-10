const path = require('path');
const FRAMEWORK_NAME = 'stacktrace-framework';

module.exports = function initializeFramework(
  /* config.files */ files,
  logger
) {
  const log = logger.create(FRAMEWORK_NAME);
  log.debug('Framework initialization...');

  log.debug('Adding required resources to karma files list...');
  // resolves stacktrace-js lib path
  const stacktracejs =
    path.dirname(require.resolve('stacktrace-js')) + '/dist/stacktrace.min.js';
  // push the lib and its sourcemap to the files list
  files.push(createPattern({ pattern: stacktracejs }));
  files.push(
    createPattern({ pattern: stacktracejs + '.map', included: false })
  );

  // stacktrace
  const stacktrace = require.resolve('./stacktrace');
  files.push(createPattern({ pattern: stacktrace }));
};

function createPattern(options) {
  return Object.assign(
    {},
    {
      included: true,
      served: true,
      watched: false
    },
    options
  );
}
