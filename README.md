.NET and Node.js in-process on Electron
================


This is a fork of [edge-js](https://github.com/agracio/edge-js) adapted to support [Electron](https://github.com/electron/electron/).

Compatible with
 * Electron 1.6.x - Node.js v7.4.0.
 * Electron 1.7.x - Node.js v7.9.0.
 * Electron 1.8.x - Node.js v8.2.1.
 * Electron 2.x - Node.js v8.9.3.
 * Electron 3.x - Node.js v10.2.0.
 * Electron 4.0.4+ - Node.js v10.11.0.
 * Electron 5.x - Node.js v12.0.0.
 * Electron 6.x - Node.js v12.4.0.
 * Electron 7.x - Node.js v12.8.1
 
Usage is the same as edge or edge-js, replace `require('edge')` or `require('edge-js')` with `require('electron-edge-js')`:

```bash
npm install electron-edge-js
```

```diff
-var edge = require('edge-js');
+var edge = require('electron-edge-js');

var helloWorld = edge.func(function () {/*
    async (input) => {
        return ".NET Welcomes " + input.ToString();
    }
*/});
```

## Requirements (Windows)

You must install [Microsoft Visual C++ Redistributable (x86)](https://www.microsoft.com/en-us/download/details.aspx?id=52685)


## Why use `electron-edge-js`?

Electron is built using specific version of Node.js. In order to use `edge` in Electron project you would need to recompile it using the same Node.js version and Electron headers.

`electron-edge-js` comes precompiled with correct Node.js versions and headers.

## Differences from `electron-edge`

* Uses same codebase as `edge-js` that comes with both latest code changes from `edge` project and additional fixes and improvements available in `edge-js` project.
* Supports majority of Electron versions.

## Quick start

Simple app that shows how to work with .NET Core using compiled C# libraries. https://github.com/agracio/electron-edge-js-quick-start