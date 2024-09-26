var fs = require('fs')
	, path = require('path')
	, spawn = require('child_process').spawn
	, whereis = require('./whereis');

if (process.platform === 'win32') {
	var libroot = path.resolve(__dirname, '../lib/native/win32')
		, lib32bit = path.resolve(libroot, 'ia32')
		, lib64bit = path.resolve(libroot, 'x64')
		, libarm64 = path.resolve(libroot, 'arm64');

	function copyFile(filePath, filename) {
		return function(copyToDir) {
			//console.log( 'copy '+filename+' from '+filePath+' to '+ copyToDir );
			outFile = path.resolve(copyToDir, filename);
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

	var redist = [
        'concrt140.dll',
        'msvcp140.dll',
        'vccorlib140.dll',
        'vcruntime140.dll',
	];

	var dest32dirs = getDestDirs(lib32bit);
	var dest64dirs = getDestDirs(lib64bit);
	var destarmdirs = getDestDirs(libarm64);

	function copyRedist(lib, destDirs){
		redist.forEach(function (dllname) {
			var dll = path.resolve(lib, dllname);
			destDirs.forEach(copyFile(dll, dllname));
		});
	}

	copyRedist(lib32bit, dest32dirs);
	copyRedist(lib64bit, dest64dirs);
	copyRedist(libarm64, destarmdirs);

	var dotnetPath = whereis('dotnet', 'dotnet.exe');

	if (dotnetPath) {
		spawn(dotnetPath, ['restore'], { stdio: 'inherit', cwd: path.resolve(__dirname, '..', 'lib', 'bootstrap') })
			.on('close', function() {
				spawn(dotnetPath, ['build', '--configuration', 'Release'], { stdio: 'inherit', cwd: path.resolve(__dirname, '..', 'lib', 'bootstrap') })
					.on('close', function() {
						//require('./checkplatform');
					});
			});
	}

	else {
		//require('./checkplatform');
	}
} 

else {
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

	location = locateElectronPrebuilt();
	version = null;
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
			console.error("Unable to find electron-prebuilt's version number, either install it or specify an explicit version");
		}
	}
	if (version !== null)
	{
		spawn('node-gyp', ['configure', '--target='+version, '--runtime=electron', '--disturl=https://electronjs.org/headers'], { stdio: 'inherit' });

		if(version.startsWith('32')){
			spawn("sed -i -e 's/std:c++17/std:c++20/g' build/build_managed.vcxproj", { stdio: 'inherit' });
			spawn("sed -i -e 's/std:c++17/std:c++20/g' build/edge_coreclr.vcxproj", { stdio: 'inherit' });
			spawn("sed -i -e 's/std:c++17/std:c++20/g' build/edge_nativeclr.vcxproj", { stdio: 'inherit' });
		}
		spawn('node-gyp', ['build'], { stdio: 'inherit' });
	}
	else
		spawn('node-gyp', ['configure', 'build'], { stdio: 'inherit' });
   		
}
