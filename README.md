# .NET and Node.js in-process on Electron

This is a fork of [edge-js](https://github.com/agracio/edge-js) adapted to support [Electron](https://github.com/electron/electron/).

### Windows binaries pre-compiled for 

| Electron      | Node.Js Version  |
| ------------- | ---------------- |
| Electron 17.x | v16.13.0         |
| Electron 18.x | v16.13.2         |
| Electron 19.x | v16.14.2         |
| Electron 20.x | v16.15.0         |
| Electron 21.x | v16.16.0         |
| Electron 22.x | v16.17.1         |
| Electron 23.x | v18.12.1         |
| Electron 24.x | v18.14.0         |
| Electron 25.x | v18.15.0         |
| Electron 26.x | v18.16.1         |
| Electron 27.x | v18.17.1         |
| Electron 28.x | v18.18.2         |
| Electron 29.x | v20.9.0          |

- You do not need to use same version of Node.js in your project as Electron Node.js version
- On Linux and MacOS `npm install` will compile binaries with correct Node.Js headers for given Electron version.

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
## Migration to .NET Core 3.1 :exclamation: 

Edge.Js C# code has been migrated to .NET 3.1. If your project is referencing `EdgeJs.dll` and/or `Edge.js.CSharp.dll` file locations have changed.

```bash
node_modules/electron-edge-js/lib/bootstrap/bin/Release/netcoreapp3.1/EdgeJs.dll
node_modules/electron-edge-js/lib/bootstrap/bin/Release/netcoreapp3.1/Edge.js.CSharp.dll
```

## Requirements (Windows)

You must install [Microsoft Visual C++ Redistributable (x86)](https://www.microsoft.com/en-us/download/details.aspx?id=52685)

## Why use `electron-edge-js`?

Electron is built using specific version of Node.js. In order to use `edge-js` in Electron project you would need to recompile it using the same Node.js version and Electron headers.

`electron-edge-js` comes precompiled with correct Node.js versions and headers.

## Quick start

Sample app that shows how to work with .NET Core using inline code and compiled C# libraries.  
https://github.com/agracio/electron-edge-js-quick-start

## MacOS

`edge-js` and `electron-edge-js` will fail to build on MacOS if Visual Studion for mac is installed.
VS installs Mono runtimes that `edge-js` fails to access durring `nmp install`. 
Removing VS does not remove Mono fully and leaves behind incomplete Mono install.
To remove Mono from macOS use this script

```bash
sudo rm -rf /Library/Frameworks/Mono.framework
sudo pkgutil --forget com.xamarin.mono-MDK.pkg
sudo rm /etc/paths.d/mono-commands
```

## Packaging Electron application

'electron-edge-js' needs to be specified as external module, some examples<br/>  
``webpack.config.js ``
```js
     externals: {
    'electron-edge-js': 'commonjs2 electron-edge-js',
    },
    node: {
        __dirname: false,
        __filename: false,
    },
```  
``vue.config.js``
```js
    module.export = {
        pluginOptions: {
            electronBuilder: {
            externals:["electron-edge-js"]
        }
    }
```  
Packaging example based on `electron-edge-js-quick-start`.  
https://github.com/zenb/electron-edge-js-quick-start  
  
Related issues to use for troubleshooting:  
https://github.com/agracio/electron-edge-js/issues/138  
https://github.com/agracio/electron-edge-js/issues/39  
https://github.com/agracio/electron-edge-js/issues/74  
https://github.com/agracio/electron-edge-js/issues/21



## Async execution

Underlying 'edge' component is written as synchronous C++ Node.js module and will cause Electron app to freeze when executing long running .NET code.  
For workaround refer to this issue: https://github.com/agracio/electron-edge-js/issues/97

## Documentation

For full documentation see [edge-js](https://github.com/agracio/edge-js) repo.

## Build

Build.bat supports only Electron major versions.
