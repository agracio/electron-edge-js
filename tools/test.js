var spawn = require('child_process').spawn;
var path = require('path');
var testDir = path.resolve(__dirname, '../test');
var input = path.resolve(testDir, 'tests.cs');
var output = path.resolve(testDir, 'Edge.Tests.dll');
var buildParameters = ['-target:library', '/debug', '-out:' + output, input];

var electron = require('electron')
var runner = process.argv[2];

if (process.platform !== 'win32') {
    process.env.EDGE_USE_CORECLR = 1
}

if (!process.env.EDGE_USE_CORECLR) {
	if (process.platform !== 'win32') {
		buildParameters = buildParameters.concat(['-sdk:4.5']);
	}
    var compiler = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe'
	run(process.platform === 'win32' ? compiler : 'mcs', buildParameters, runOnSuccess);
}

else {
    run(process.platform === 'win32' ? 'dotnet.exe' : 'dotnet', ['restore'], function(code, signal) {
        if (code === 0) {
            run(process.platform === 'win32' ? 'dotnet.exe' : 'dotnet', ['build'], runOnSuccess);
        }
    });
}

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
