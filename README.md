# .NET and Node.js in-process on Electron

This is a fork of [edge-js](https://github.com/agracio/edge-js) adapted to support [Electron](https://github.com/electron/electron/).

Compatible with

- Electron 6.x - Node.js v12.4.0.
- Electron 7.x - Node.js v12.8.1
- Electron 8.x - Node.js v12.13.0
- Electron 9.x - Node.js v12.14.1
- Electron 10.x - Node.js v12.16.3
- Electron 11.x - Node.js v12.18.3
- Electron 12.x - Node.js v14.16.0
- Electron 13.x - Node.js v14.16.0
- ~~Electron 14.x - Node.js v14.17.0~~
- Electron 15.x - Node.js v16.5.0
- Electron 16.x - Node.js v16.9.1
- Electron 17.x - Node.js v16.13.0
- Electron 18.x - Node.js v16.13.2
- Electron 19.x - Node.js v16.14.2

Usage is the same as edge or edge-js, replace `require('edge-js')` with `require('electron-edge-js')`:

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

## Quick start

Simple app that shows how to work with .NET Core using compiled C# libraries.  
https://github.com/agracio/electron-edge-js-quick-start

## MacOS

`edge-js` and `electron-edge-js` will fail to build on MacOS if Visual Studion for mac is installed.
VS installs Mono runtimes that `edge-js` fails to access durring `nmp install`.

## Packaging Electron application

Packaging example based on the app above.  
https://github.com/zenb/electron-edge-js-quick-start

Related issues to use for troubleshooting:  
https://github.com/agracio/electron-edge-js/issues/39  
https://github.com/agracio/electron-edge-js/issues/74  
https://github.com/agracio/electron-edge-js/issues/21

## Async execution

Underlying 'edge' component is written as synchronous C++ Node.js module and will cause Electron app to freeze when executing long running .NET code.  
For workaround refer to this issue: https://github.com/agracio/electron-edge-js/issues/97

## Documentation

For full documentation please see see original [edge-js](https://github.com/agracio/edge-js) repo.

## Build

Build.bat supports only Electron major versions.
