/* eslint-env browser */
/* global StackTrace */

(function stacktrace(opener, jasmine, QUnit) {
    // works only in debug mode
    if (!opener) {
        if (!jasmine) {
            registerJasmineReporter();
        }
        if (!QUnit) {
            registerQUnitReporter();
        }
    }

    /**
     * Registrates Jasmine reporter
     */
    function registerJasmineReporter() {
        var reporter = {
            specDone: function (result) {
                if (result.status !== "failed") {
                    return;
                }

                var output = ['Spec: ' + result.description + ' was ' + result.status];

                result.failedExpectations.forEach(function (failedExpectation) {
                    output.push('Failure: ' + failedExpectation.message);

                    parseStackTrace(failedExpectation.stack).then(function (stackFrames) {
                        output.push(stackFrames.filter(function (frame) {
                            //exclude jasmine-specific stack
                            return !/.\jasmine\.js/.test(frame);
                        }).map(function (frame) {
                            return '\t' + frame;
                        }).join('\n\n'));
                        console.error(output.join('\n')); //eslint-disable-line no-console
                    });
                });

            }
        };

        jasmine.getEnv().addReporter(reporter);
    }

    /**
     * Registrates QUnit reporter
     */
    function registerQUnitReporter() {
        QUnit.log(function (details) {
            if (details.result) {
                return;
            }

            parseStackTrace(details.source).then(function (stackFrames) {
                var loc = details.module + ": " + details.name + ": ",
                    output = ["FAILED: " + loc + (details.message ? details.message : "")];

                if (details.actual) {
                    output.push("expected: " + details.expected + ", actual: " + details.actual);
                }

                output.push(stackFrames.filter(function (frame) {
                    return !/.\qunit\.js/.test(frame);
                }).map(function (frame) {
                    return '\t' + frame;
                }).join('\n\n'));
                console.error(output.join('\n')); //eslint-disable-line no-console
            });
        });
    }

    /**
     * Parses the stacktrace using stacktrace-js either using a web worker (if supported) or falls back to main thread
     * @param {string} stack stacktrace
     * @returns {Promise} parsed stackframes
     */
    function parseStackTrace(stack) {
        if (window.Worker && window.URL && window.Blob) {
            const worker = createStackTraceWorker(getStacktracejsURL());
            return scheduleStackTraceWorker(stack, worker);
        } else {
            return StackTrace.fromError({ stack: stack }, { sourceCache: sourceCache });
        }
    }

    /**
     * Returns stacktrace-js URL
     * @returns {string} stacktrace-js URL
     */
    function getStacktracejsURL() {
        const scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (/stacktrace\.min\.js$/.test(scripts[i].getAttribute('src'))) {
                return location.origin + scripts[i].getAttribute('src');
            }
        }
    }

    /**
     * Creates a web worker to parse stacktrace using stacktrace-js 
     * @param {string} stacktracejsURL URL to stacktrace-js 
     * @returns {WebWorker} web worker
     */
    function createStackTraceWorker(stacktracejsURL) {
        const blob = new Blob([buildWorkerScript(stacktracejsURL)]);
        const blobURL = URL.createObjectURL(blob);
        var worker = new Worker(blobURL);
        worker.addEventListener('error', function (e) {
            console.error(e); // eslint-disable-line no-console
        }, false);

        return worker;
    }

    /**
     * Schedules the web worker for parsing the passed stack
     * @param {string} stack stacktrace
     * @param {WebWorker} worker web worker
     */
    function scheduleStackTraceWorker(stack, worker) {
        return new Promise(function (resolve) {
            function callback(response) {
                const error = response.data[0];
                const stackFrames = response.data[1];
                if (stack === error.stack) {
                    stackFrames.forEach(function (s) {
                        s.toString = function () { return s.serialized; };
                    });
                    resolve(stackFrames);
                    worker.removeEventListener('message', callback, false);
                }
            }

            worker.addEventListener('message', callback, false);
            worker.postMessage({ stack: stack });
        });
    }

    const currentPage = location.href.replace(/[\(\)\s]/g, '');

    const sourceCache = {
        '<anonymous>': ' ' // prevent calls to "<anonymous>" page (using Promise from web console)
    };
    sourceCache[currentPage] = ' '; // prevent calls to current page

    /**
     * Builds web worker script
     * @param {string} stacktracejsURL stacktrace-js URL
     * @returns {string} web worker script
     */
    function buildWorkerScript(stacktracejsURL) {
        return  'importScripts("' + stacktracejsURL + '");' +
                'var sourceCache = {' +
                    '"' + currentPage + '": " ",' +
                    '"<anonymous>": " "' +
                '};' +
                'onmessage = function (e) {' +
                    'StackTrace.fromError(e.data, {' +
                        'sourceCache: sourceCache' +
                    '}).then(function (stackFrames) {' +
                        'stackFrames.forEach(function (s) { s.serialized = s.toString(); });' +
                        'postMessage([e.data, stackFrames]);' +
                    '});' +
                '};';
    }

})(window.opener, window.jasmine, window.QUnit);