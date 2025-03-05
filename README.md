# .NET and Node.js in-process on Electron

[![Actions Status](https://github.com/agracio/electron-edge-js/workflows/Test/badge.svg)](https://github.com/agracio/electron-edge-js/actions)
[![Git Issues][issues-img]][issues-url]
[![Closed Issues][closed-issues-img]][closed-issues-url]
<!-- [![NPM Downloads][downloads-img]][downloads-url] -->

**This is a fork of [edge-js](https://github.com/agracio/edge-js) adapted to support [Electron](https://github.com/electron/electron/)**

### Windows binaries pre-compiled for 

| Electron        |  x86/x64           | arm64              |
| --------------- |  ----------------- | ------------------ |
| Electron 29.x   | :heavy_check_mark: | :heavy_check_mark: |
| Electron 30.x   | :heavy_check_mark: | :heavy_check_mark: |
| Electron 31.x   | :heavy_check_mark: | :heavy_check_mark: |
| Electron 32.x   | :heavy_check_mark: | :heavy_check_mark: |
| Electron 33.x   | :heavy_check_mark: | :heavy_check_mark: |
| Electron 34.x   | :heavy_check_mark: | :heavy_check_mark: |
| Electron 35.x   | :heavy_check_mark: | :heavy_check_mark: |


#### On Linux and macOS `npm install` will compile binaries with correct Electron headers for a given Electron version.

### Linux/macOS suppoted versions

| Electron         | x64                | arm64              |
| ---------------  | ------------------ | ------------------ |
| Electron 29 - 35 | :heavy_check_mark: | :heavy_check_mark: |

#### Usage is the same as edge-js, replace `require('edge-js')` with `require('electron-edge-js')`:

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

## Quick start

Sample app that shows how to work with .NET Core using inline code and compiled C# libraries.  
https://github.com/agracio/electron-edge-js-quick-start

## Pre-requisites
- Windows: [Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170#latest-microsoft-visual-c-redistributable-version)

## Packaging Electron application

`electron-edge-js` needs to be specified as an external module, some examples<br/>  

### webpack
 
``webpack.config.js ``

```js
externals: {
    'electron-edge-js': 'commonjs2 electron-edge-js',
},
node: {
    __dirname: true,
    __filename: true,
},
```

### From [#138](https://github.com/agracio/electron-edge-js/issues/138)

``webpack.config.js ``

```js
externals: {
    'electron-edge-js': 'commonjs2 electron-edge-js',
},
node: {
    __dirname: false,
    __filename: false,
},
extraResources:[
    "./node_modules/electron-edge-js/**",
]
```

Electron `main.js` 

```js
// https://github.com/ScottJMarshall/electron-webpack-module-resolution
require("module").globalPaths.push(process.cwd()+'/node_modules');
var edge = require('electron-edge-js');
```

### Vue.js

``vue.config.js``

```js
module.export = {
    pluginOptions: {
        electronBuilder: {
            externals:["electron-edge-js"]
        }
    }
}
```  
 
Related issues to use for troubleshooting:  
https://github.com/agracio/electron-edge-js/issues/39  
https://github.com/agracio/electron-edge-js/issues/74  
https://github.com/agracio/electron-edge-js/issues/21  
https://github.com/agracio/electron-edge-js/issues/138

## electron-builder

`electron-edge-js` should be excluded from rebuild.

## electron-forge

electron-forge example based on `electron-edge-js-quick-start`  
https://github.com/agracio/electron-edge-js-quick-start-forge

## Async execution

If `electron-edge-js` module is used on main Electron thread it will cause Electron app to freeze when executing long-running .NET code even if your C# code is fully async.  
To avoid this you can use worker thread packages such as **[threads.js](https://www.npmjs.com/package/threads)** or **[piscina](https://www.npmjs.com/package/piscina)**  


This issue is not present when using Electron [IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)

### Workaround from [#97]( https://github.com/agracio/electron-edge-js/issues/97)

`main.js`
```js
const { fork } = require("child_process"); fork("../child.js", [], { env: {file: 'filename'}, })
```

`child.js`
```js
const path = require('path');
const powerpoint = require('office-script').powerpoint;
const filePath = '../../directory/';

powerpoint.open(path.join(${remotePath}${process.env.file}.pptx), function(err) {
    if(err) throw err;
});
```

## Window refresh issue

If `electron-edge-js` module is used on main Electron thread refreshing the window (F5, Ctrl+R, Command+R etc) will cause a hard crash in `electron-edge-js` module and Electron app.  
Currently there is no solution to this issue other than using Electron [IPC](https://www.electronjs.org/docs/latest/tutorial/ipc).

## Documentation

For full documentation see [edge-js](https://github.com/agracio/edge-js) repo.

[issues-img]: https://img.shields.io/github/issues-raw/agracio/electron-edge-js.svg?style=flat-square
[issues-url]: https://github.com/agracio/electron-edge-js/issues
[closed-issues-img]: https://img.shields.io/github/issues-closed-raw/agracio/electron-edge-js.svg?style=flat-square&color=brightgreen
[closed-issues-url]: https://github.com/agracio/electron-edge-js/issues?q=is%3Aissue+is%3Aclosed

[downloads-img]: https://img.shields.io/npm/d18m/electron-edge-js.svg?style=flat-square
[downloads-url]: https://img.shields.io/npm/d18m/electron-edge-js.svg
