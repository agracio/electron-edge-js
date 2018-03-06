.NET and Node.js in-process on Electron
================
[![Build Status](https://travis-ci.org/agracio/electron-edge-js.svg)](https://travis-ci.org/agracio/electron-edge-js)[![Build status](https://ci.appveyor.com/api/projects/status/jnospsu289r41by1?svg=true)](https://ci.appveyor.com/project/agracio/electron-edge-js)


This is a fork of [edge-js](https://github.com/agracio/edge-js) adapted to support [Electron](https://github.com/electron/electron/).

Compatible with
 * Electron 1.4.x - Node.js v6.5.0.
 * Electron 1.6.x - Node.js v7.4.0.
 * Electron 1.7.x - Node.js v7.9.0.
 * Electron 1.8.x - Node.js v8.2.1.
 * Electron 2.0.x - Node.js v8.9.3.

Usage is the same as edge or edge-js, replace `require('edge')` or `require('edge-js')` with `require('electron-edge-js')`:

```bash
npm install electron-edge-js
```

```diff
-var edge = require('edge');
+var edge = require('electron-edge-js');

var helloWorld = edge.func(function () {/*
    async (input) => {
        return ".NET Welcomes " + input.ToString();
    }
*/});
```


## Why use `electron-edge-js`?

Electron is built using specific version of Node.js. In order to use `edge` in Electron project you would need to recompile it using the same Node.js version.

`electron-edge-js` comes precompiled with correct Node.js versions.

## Differences from `electron-edge`

* Uses same codebase as `edge-js` that comes with both latest code changes from `edge` project and additional fixes and improvements available in `edge-js` project.
* Supports majority of Electron versions.
