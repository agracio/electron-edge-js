const fs = require('fs')
	, path = require('path')
	, spawn = require('child_process').spawn
	, checkMono = require('./checkMono');

if (process.platform === 'win32') {
	const libroot = path.resolve(__dirname, '../lib/native/win32')
		, lib32bit = path.resolve(libroot, 'ia32')
		, lib64bit = path.resolve(libroot, 'x64')
		, libarm64 = path.resolve(libroot, 'arm64');

	function copyFile(filePath, filename) {
		return function(copyToDir) {
			//console.log( 'copy '+filename+' from '+filePath+' to '+ copyToDir );
			let outFile = path.resolve(copyToDir, filename);
			if ( fs.existsSync( outFile ) ) {
				// clear readonly: add write permission to ogw (222 octal -> 92 hex -> 146 decimal)
				fs.chmodSync( outFile, fs.statSync(outFile).mode | 146 )
			}
			fs.writeFileSync(path.resolve(copyToDir, filename), fs.readFileSync(filePath));
		};
	}

	function isDirectory(info) {
		return info.isDirectory;
	}

	function getInfo(basedir) {
		return function(file) {
			var filepath = path.resolve(basedir, file);

			return {
				path: filepath,
				isDirectory: fs.statSync(filepath).isDirectory()
			};
		}
	}

	function getPath(info) {
		return info.path;
	}

	function getDestDirs(basedir){
		return fs.readdirSync(basedir)
		.map(getInfo(basedir))
		.filter(isDirectory)
		.map(getPath);
	}

	const redist = [
        'concrt140.dll',
        'msvcp140.dll',
        'vccorlib140.dll',
        'vcruntime140.dll',
	];

	const dest32dirs = getDestDirs(lib32bit);
	const dest64dirs = getDestDirs(lib64bit);
	const destarmdirs = getDestDirs(libarm64);

	function copyRedist(lib, destDirs){
		redist.forEach(function (dllname) {
			var dll = path.resolve(lib, dllname);
			destDirs.forEach(copyFile(dll, dllname));
		});
	}

	copyRedist(lib32bit, dest32dirs);
	copyRedist(lib64bit, dest64dirs);
	copyRedist(libarm64, destarmdirs);

	spawn('dotnet', ['restore'], { stdio: 'inherit', cwd: path.resolve(__dirname, '..', 'lib', 'bootstrap') })
	.on('close', function() {
		spawn('dotnet', ['build', '--configuration', 'Release'], { stdio: 'inherit', cwd: path.resolve(__dirname, '..', 'lib', 'bootstrap') })
			// .on('close', function() {
			// 	require('./checkplatform');
			// });
	});

} 

else {
	let version = getVersion();
	if(process.platform === 'darwin' && version){
		const electronVersion = version.split(".")[0];
		const edjeNative = path.resolve(__dirname, '../lib/native/' + process.platform + '/' + process.arch + '/' + electronVersion + '/' + 'edge_nativeclr.node');
		const edjeNativeClr = path.resolve(__dirname, '../lib/native/' + process.platform + '/' + process.arch + '/' + electronVersion + '/' + 'edge_coreclr.node');

		const checkNative = checkMono() ? fs.existsSync(edjeNative) : true;

		if(checkNative && fs.existsSync(edjeNativeClr)){
			
			if(fs.existsSync(path.resolve(__dirname, '../build'))){
				fs.rmSync(path.resolve(__dirname, '../build'), { recursive: true, force: true });
			}

				spawn('dotnet', ['restore'], { stdio: 'inherit', cwd: path.resolve(__dirname, '..', 'lib', 'bootstrap') })
				.on('close', function() {
					spawn('dotnet', ['build', '--configuration', 'Release'], { stdio: 'inherit', cwd: path.resolve(__dirname, '..', 'lib', 'bootstrap') })
				});
		}
		else{
			build();
		}
	} 
	else {
		build();
	}  		
}

function getVersion(){
	
	// Code from electron-prebuild: https://github.com/electron/electron-rebuild
	const possibleModuleNames = ['electron', 'electron-prebuilt', 'electron-prebuilt-compile'];
	function locateElectronPrebuilt () {
		let electronPath;

		// Attempt to locate modules by path
		let foundModule = possibleModuleNames.some((moduleName) => {
			electronPath = path.join(__dirname, '..', '..', moduleName);
			return fs.existsSync(electronPath);
		});

		// Return a path if we found one
		if (foundModule) return electronPath;

		// Attempt to locate modules by require
		foundModule = possibleModuleNames.some((moduleName) => {
			try {
			electronPath = path.join(require.resolve(moduleName), '..');
			} catch (e) {
			return false;
			}
			return fs.existsSync(electronPath);
		});

		// Return a path if we found one
		if (foundModule) return electronPath;
		return null;
	}

	let location = locateElectronPrebuilt();
	let version = null;
	electronPath = null;
	if (location != null)
	{ 
		// NB: We assume here that electron-prebuilt is a sibling package of ours
		pkg = null;
		try {
			let pkgJson = path.join(location, 'package.json');

			pkg = require(pkgJson);

			version = pkg.version;
		} catch (e) {
			console.error("Unable to find electron version number, install is using 'npm i electron'");
		}
	}

	if(!version){
		console.error("Unable to find electron version number, install is using 'npm i electron'");
	}

	return version;
}

function build(){
	let version = getVersion();
	if (version !== null)
	{
		spawn('node-gyp', ['configure', 'build', '--target='+version, '--runtime=electron', '--disturl=https://electronjs.org/headers', '--release'], { stdio: 'inherit' });
	}
	
	else{
		spawn('node-gyp', ['configure', 'build'], { stdio: 'inherit' });
	}
}
