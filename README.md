# karma-stacktrace

![actions](https://github.com/sergei-startsev/karma-stacktrace/workflows/Node%20CI/badge.svg)
![npm](https://img.shields.io/npm/v/karma-stacktrace)
![GitHub](https://img.shields.io/github/license/sergei-startsev/karma-stacktrace)

## What

Karma framework to provide human-readable mapped stacktraces for failed tests to make debugging easier in your browser.

## Motivation

Test frameworks like [QUnit](https://qunitjs.com/) and [Jasmine](http://jasmine.github.io/) use [non-standard](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack) `stack` property of `Error` object to output a stacktrace for failed unit tests.
Modern browsers do not apply sourcemaps to `Error.prototype.stack` and unmapped stacktrace looks useless.

An example of an unmapped stacktrace:

![Original stacktrace](./stacktrace-original.png 'Original stacktrace')

The framework catches failed tests and reports mapped stacktrace by using [stacktrace-js](https://www.stacktracejs.com/) library:

![Mapped stacktrace](./stacktrace-mapped.png 'Mapped stacktrace')

## Install

Install with `yarn`:

`yarn add karma-stacktrace`

With `npm`:

`npm install karma-stacktrace`

## Karma configuration

Add `stacktrace` to the list of frameworks in your karma configuration:

```js
// karma.conf.js
module.exports = function (config) {
  config.set({
    //...
    frameworks: ['stacktrace']
    //...
  });
};
```

To avoid blocking the main execution thread [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) is used by default for parsing/mapping stacktrace,
however you can disable it by setting `useWorker` option to `false`:

```js
// karma.conf.js
module.exports = function (config) {
  config.set({
    //...
    client: {
      stacktrace: {
        useWorker: false
      }
    }
    //...
  });
};
```

If you use inline sourcemaps (`devtool: 'inline-source-map'`) you need to disable the web worker.

## Limitations/Gotchas

- The framework supports [Jasmine](http://jasmine.github.io/) and [QUnit](https://qunitjs.com/) testing frameworks.
- The framework **does not affect** stacktrace in original messages, it attaches isolated reporters to trace mapped stacktrace.
- Set `useWorker` option to `false` value for inline sourcemaps to get mapped stacktrace.

## Examples

See the [karma configuration example](https://github.com/sergei-startsev/karma-stacktrace/tree/master/examples) used with webpack 5 configured to emit external sourcemaps (`devtool: 'source-map'`).

## Inspired by

- [sourcemapped-stacktrace](https://github.com/novocaine/sourcemapped-stacktrace)
