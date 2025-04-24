var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var testDir = path.resolve(__dirname, '../test');
var input = path.resolve(testDir, 'tests.cs');
var output = path.resolve(testDir, 'Edge.Tests.dll');
var buildParameters = ['-target:library', '/debug', '-out:' + output, input];

var electron = require('electron')
const checkMono = require('./checkMono');
var runner = process.argv[2];

if(process.platform === 'linux' && !process.env.EDGE_USE_CORECLR){
    Object.assign(process.env, {
        // Work around Mono problem: undefined symbol: mono_add_internal_call_with_flags
        LD_PRELOAD: 'libmono-2.0.so libmonosgen-2.0.so libstdc++.so.6',
    });
}

function build(){
    if (!process.env.EDGE_USE_CORECLR) {
        if (process.platform !== 'win32') {
            buildParameters = buildParameters.concat(['-sdk:4.5']);
        }

        let compiler;

        if(process.platform === 'win32'){
            compiler = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe'
        }
        else if(checkMono()){
            compiler = 'mcs'
        }
        
        if(compiler){
            dotnet(compiler, buildParameters);
        }
        else{
            coreclr();
        }
    }

    else {
        coreclr();
    }
}

function dotnet(compiler, buildParameters){
    run(compiler, buildParameters, runOnSuccess);
}

function coreclr(){
    run(process.platform === 'win32' ? 'dotnet.exe' : 'dotnet', ['restore'], function(code, signal) {
        if (code === 0) {
            run(process.platform === 'win32' ? 'dotnet.exe' : 'dotnet', ['build'], function(code, signal) {
                if (code === 0) {
                    try{
                        fs.mkdirSync('test/测试', { recursive: true })
                    }
                    catch (e){
                        console.error(e);
                        throw e;
                    }
                    fs.copyFile('test/bin/Debug/test.dll', 'test/测试/Edge.Tests.CoreClr.dll', (e) => {
                        if (e) {
                            console.error(e);
                            throw e;
                        }
                        runOnSuccess(0);
                    });
                }
            });
        }
    });
}

build();

function run(cmd, args, onClose){

	var params = process.env.EDGE_USE_CORECLR ? {cwd: testDir} : {};
    var command = spawn(cmd, args, params);
    var result = '';
    var error = '';
    command.stdout.on('data', function(data) {
        result += data.toString();
    });
    command.stderr.on('data', function(data) {
        error += data.toString();
    });

    command.on('error', function(err) {
        console.log(error);
        console.log(err);
    });

    command.on('close', function(code){
        console.log(result);
        onClose(code, '');
	});
}

function runOnSuccess(code, signal) {
	if (code === 0) {
		process.env['EDGE_APP_ROOT'] = path.join(testDir, 'bin', 'Debug');
		var electronPath = path.resolve(__dirname, '../test/main.js')
		spawn(electron, [electronPath, runner], { 
			stdio: 'inherit' 
		}).on('error', function(err) {
			console.log(err); 
		});
	}
}
