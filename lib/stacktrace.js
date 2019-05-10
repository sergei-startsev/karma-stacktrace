/* eslint-env browser */
/* global StackTrace */

(function stacktrace(jasmine, QUnit) {
  // prevents running in iframe
  if (window.parent === window) {
    if (jasmine) {
      registerJasmineReporter();
    }
    if (QUnit) {
      registerQUnitReporter();
    }
  }

  /**
   * Registers Jasmine reporter.
   * @returns {undefined}
   */
  function registerJasmineReporter() {
    const reporter = {
      specDone: result => {
        if (result.status !== 'failed') {
          return;
        }

        const { fullName } = result;
        const output = [`[KARMA-STACKTRACE] ${fullName}`];

        result.failedExpectations.forEach(failedExpectation => {
          const { message, stack } = failedExpectation;
          output.push(`Error: ${message}`);

          parseStackTrace(stack).then(stackFrames => {
            output.push(
              stackFrames
                .filter(frame => !/.jasmine\.js/.test(frame))
                .map(frame => '\t' + frame)
                .join('\n\n')
            );
            console.error(output.join('\n')); //eslint-disable-line no-console
          });
        });
      }
    };

    jasmine.getEnv().addReporter(reporter);
  }

  /**
   * Registers QUnit reporter.
   * @returns {undefined}
   */
  function registerQUnitReporter() {
    QUnit.log(details => {
      const {
        result,
        name,
        source,
        module,
        message,
        expected,
        actual
      } = details;

      if (result || name === 'global failure') {
        return;
      }

      parseStackTrace(source).then(stackFrames => {
        const fullName = `${module} ${name}`;
        const output = [`[KARMA-STACKTRACE] ${fullName}`];

        if (message) {
          output.push(message);
        }

        if (typeof expected !== 'undefined') {
          output.push('Expected: ' + QUnit.dump.parse(expected));
          output.push('Actual: ' + QUnit.dump.parse(actual));
        }

        const frames = stackFrames
          .filter(frame => !/.qunit\.js/.test(frame))
          .map(frame => '\t' + frame)
          .join('\n\n');
        output.push(frames);

        console.error(output.join('\n')); //eslint-disable-line no-console
      });
    });
  }

  /**
   * Parses the stacktrace with stacktrace-js either using a web worker (if supported)
   * or falling back to the main thread.
   * @param {string} stack stacktrace
   * @returns {Promise} parsed stackframes
   */
  function parseStackTrace(stack) {
    if (window.Worker && window.URL && window.Blob) {
      const worker = createStackTraceWorker(getStacktracejsURL());
      return scheduleStackTraceWorker(stack, worker);
    } else {
      return StackTrace.fromError({ stack }, { sourceCache });
    }
  }

  /**
   * Returns stacktrace-js lib URL.
   * @returns {string} stacktrace-js lib URL
   */
  function getStacktracejsURL() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (/stacktrace\.min\.js$/.test(scripts[i].getAttribute('src'))) {
        return location.origin + scripts[i].getAttribute('src');
      }
    }
  }

  /**
   * Creates a web worker to parse stacktrace using stacktrace-js.
   * @param {string} stacktracejsURL URL to stacktrace-js
   * @returns {WebWorker} web worker
   */
  function createStackTraceWorker(stacktracejsURL) {
    const blob = new Blob([buildWorkerScript(stacktracejsURL)]);
    const blobURL = URL.createObjectURL(blob);
    const worker = new Worker(blobURL);
    worker.addEventListener(
      'error',
      e => {
        console.error(e); // eslint-disable-line no-console
      },
      false
    );

    return worker;
  }

  /**
   * Schedules the web worker for parsing the passed stack
   * @param {string} stack stacktrace
   * @param {WebWorker} worker web worker
   * @returns {Promise} stackframes
   */
  function scheduleStackTraceWorker(stack, worker) {
    return new Promise(resolve => {
      function callback(response) {
        const error = response.data[0];
        const stackFrames = response.data[1];
        if (stack === error.stack) {
          stackFrames.forEach(s => {
            s.toString = function() {
              return s.serialized;
            };
          });
          resolve(stackFrames);
          worker.removeEventListener('message', callback, false);
        }
      }

      worker.addEventListener('message', callback, false);
      worker.postMessage({ stack: stack });
    });
  }

  const currentPage = location.href.replace(/[()\s]/g, '');

  const sourceCache = {
    '<anonymous>': ' ' // prevents calls to "<anonymous>" page (using Promise from web console)
  };
  sourceCache[currentPage] = ' '; // prevents calls to the current page

  /**
   * Builds web worker script
   * @param {string} stacktracejsURL stacktrace-js URL
   * @returns {string} web worker script
   */
  function buildWorkerScript(stacktracejsURL) {
    return `importScripts("${stacktracejsURL}");
      var sourceCache = {"${currentPage}": " ","<anonymous>": " "};
      onmessage = function (e) {
        StackTrace.fromError(e.data, { sourceCache: sourceCache})
            .then(function (stackFrames) {
                stackFrames.forEach(function (s) { s.serialized = s.toString(); });
                postMessage([e.data, stackFrames]);
            });
      };`;
  }
})(window.jasmine, window.QUnit);
