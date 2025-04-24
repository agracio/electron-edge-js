var fs = require('fs')
    , path = require('./electronPath')
    , builtEdge = path.resolve(__dirname, '../build/Release/' + (process.env.EDGE_USE_CORECLR || !fs.existsSync(path.resolve(__dirname, '../build/Release/edge_nativeclr.node')) ? 'edge_coreclr.node' : 'edge_nativeclr.node'))
    , edge;
const checkMono = require('../tools/checkMono');

function checkElectron(){
    // check if we are running in Electron or in Node.js
    if (!process.versions.electron) {
        throw new Error('electron-edge-js only supports running in Electron for running in Node.js use to edge-js module.');
    } 

}    
function checkForPreCompiled() {
    checkElectron();
    const preCompiledPath = path.resolve(path.join(__dirname, './native/', process.platform, process.arch, process.versions.electron.split(".")[0], (process.env.EDGE_USE_CORECLR ? 'edge_coreclr' : 'edge_nativeclr')));
    if (fs.existsSync(`${preCompiledPath}.node`)) {
        return preCompiledPath;
    }

    throw new Error(`The edge module has not been pre-compiled for ${process.versions.electron ? `Electron version ${process.versions.electron}` : `Node.js version ${process.versions.node}` }  ` +
        '. You must build a custom version of edge.node. Please refer to https://github.com/agracio/electron-edge-js ' +
        'for building instructions.');
}
var edgeNative;
if (fs.existsSync(builtEdge)) {
    checkElectron();
    edgeNative = builtEdge;
}
else if (process.platform === 'win32') {
    edgeNative = checkForPreCompiled();
}
else if(process.platform === 'darwin'){
    checkElectron();
    edgeNative = path.resolve(__dirname, './native/' + process.platform + '/' + process.arch + '/' + process.versions.electron.split(".")[0] + '/' + (process.env.EDGE_USE_CORECLR || !checkMono() ? 'edge_coreclr.node' : 'edge_nativeclr.node'));
    if(!fs.existsSync(edgeNative)){
        edgeNative = builtEdge;
        if(!fs.existsSync(edgeNative)){
            throw new Error(`Failed to build electron-edge-js for `+ process.platform + '-' + process.arch + ' v' + process.versions.electron);
        }
    }
}

else {
    throw new Error('The edge native module is not available at ' + builtEdge
        + '. You can use EDGE_NATIVE environment variable to provide alternate location of edge.node. '
        + 'If you need to build edge.node, follow build instructions for your platform at https://github.com/agracio/edge-js');
}
if (process.env.EDGE_DEBUG) {
    console.log('Load edge native library from: ' + edgeNative);
}
if (edgeNative.match(/edge_coreclr\.node$/i)) {
    // Propagate the choice between desktop and coreclr to edge-cs; this is used in deciding
    // how to compile literal C# at https://github.com/agracio/edge-js-cs/blob/master/lib/edge-cs.js
    process.env.EDGE_USE_CORECLR = 1;
}
if (process.env.EDGE_USE_CORECLR && !process.env.EDGE_BOOTSTRAP_DIR && fs.existsSync(path.join(__dirname, 'bootstrap', 'bin', 'Release', 'bootstrap.dll'))) {
    process.env.EDGE_BOOTSTRAP_DIR = path.join(__dirname, 'bootstrap', 'bin', 'Release');
}

process.env.EDGE_NATIVE = edgeNative;
if (process.versions['electron'] || process.versions['atom-shell'] || process.env.ELECTRON_RUN_AS_NODE) {
    edge = require(edgeNative);
}

exports.func = function (language, options) {
    if (!options) {
        options = language;
        language = 'cs';
    }

    if (typeof options === 'string') {
        if (options.match(/\.dll$/i)) {
            options = { assemblyFile: options };
        }
        else {
            options = { source: options };
        }
    }
    else if (typeof options === 'function') {
        var originalPrepareStackTrace = Error.prepareStackTrace;
        var stack;
        try {
            Error.prepareStackTrace = function (error, stack) {
                return stack;
            };
            stack = new Error().stack;
        }
        finally {
            Error.prepareStackTrace = originalPrepareStackTrace;
        }

        options = { source: options, jsFileName: stack[1].getFileName(), jsLineNumber: stack[1].getLineNumber() };
    }
    else if (typeof options !== 'object') {
        throw new Error('Specify the source code as string or provide an options object.');
    }

    if (typeof language !== 'string') {
        throw new Error('The first argument must be a string identifying the language compiler to use.');
    }
    else if (!options.assemblyFile) {
        var compilerName = 'edge-' + language.toLowerCase();
        var compiler;
        try {
            compiler = require(compilerName);
        }
        catch (e) {
            throw new Error("Unsupported language '" + language + "'. To compile script in language '" + language +
                "' an npm module '" + compilerName + "' must be installed.");
        }

        try {
            options.compiler = path.normalizeElectronPath(compiler.getCompiler());
        }
        catch (e) {
            throw new Error("The '" + compilerName + "' module required to compile the '" + language + "' language " +
                "does not contain getCompiler() function.");
        }

        if (typeof options.compiler !== 'string') {
            throw new Error("The '" + compilerName + "' module required to compile the '" + language + "' language " +
                "did not specify correct compiler package name or assembly.");
        }

        if (process.env.EDGE_USE_CORECLR) {
            var defaultManifest = path.join(__dirname, 'bootstrap', 'bin', 'Release', 'bootstrap.deps.json');
            var compilerManifest;
            if (compiler.getBootstrapDependencyManifest) {
                compilerManifest = compiler.getBootstrapDependencyManifest();
            }
            options.bootstrapDependencyManifest =
                compilerManifest && fs.existsSync(compilerManifest)
                    ? compilerManifest
                    : defaultManifest;
        }
    }

    if (!options.assemblyFile && !options.source) {
        throw new Error('Provide DLL or source file name or .NET script literal as a string parameter, or specify an options object '+
            'with assemblyFile or source string property.');
    }
    else if (options.assemblyFile && options.source) {
        throw new Error('Provide either an asseblyFile or source property, but not both.');
    }

    if (typeof options.source === 'function') {
        var match = options.source.toString().match(/[^]*\/\*([^]*)\*\/\s*\}$/);
        if (match) {
            options.source = match[1];
        }
        else {
            throw new Error('If .NET source is provided as JavaScript function, function body must be a /* ... */ comment.');
        }
    }

    if (options.references !== undefined) {
        if (!Array.isArray(options.references)) {
            throw new Error('The references property must be an array of strings.');
        }

        options.references.forEach(function (ref) {
            if (typeof ref !== 'string') {
                throw new Error('The references property must be an array of strings.');
            }
        });
    }

    if (options.assemblyFile) {
        if (!options.typeName) {
            var matched = options.assemblyFile.match(/([^\\\/]+)\.dll$/i);
            if (!matched) {
                throw new Error('Unable to determine the namespace name based on assembly file name. ' +
                    'Specify typeName parameter as a namespace qualified CLR type name of the application class.');
            }

            options.typeName = matched[1] + '.Startup';
        }
    }
    else if (!options.typeName) {
        options.typeName = "Startup";
    }

    if (!options.methodName) {
        options.methodName = 'Invoke';
    }

    return edge.initializeClrFunc(options);
};
