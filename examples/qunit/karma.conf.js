// Karma configuration

const path = require('path');

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    plugins: [
      'karma-qunit',
      'karma-webpack',
      'karma-chrome-launcher',
      require('../../index')
    ],
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit', 'webpack', 'stacktrace'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: '*.test.js', watched: false },
      { pattern: 'dist/**', watched: false, included: false, served: true }
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '*.test.js': ['webpack']
    },

    webpack: {
      mode: 'development',
      output: {
        filename: '[name].js',
        path: path.join(__dirname, './dist')
      },
      devtool: 'source-map',
      stats: {
        modules: false,
        colors: true
      },
      optimization: {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          cacheGroups: {
            commons: {
              name: 'commons',
              chunks: 'initial',
              minChunks: 1
            }
          }
        }
      }
    },

    webpackMiddleware: {
      // https://github.com/webpack/webpack-dev-middleware#writetodisk
      writeToDisk: true
    },

    // do not use Web Workers for `inline-source-map`
    // client: {
    //   stacktrace: {
    //     useWorker: false
    //   }
    // },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    proxies: {
      '/base/': '/'
    }
  });
};
