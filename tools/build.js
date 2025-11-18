const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let electronVersion = process.argv[2];
let version;
let nodeGyp;
const arch = ['ia32', 'x64', 'arm64'];

if (!electronVersion) {
    console.error('Electron major version argument is required');
    console.log('Usage: node build.js <major-version>');
    console.log('Example: node build.js 37');
    process.exit(1);
}

if(electronVersion.includes('.')){
    electronVersion = electronVersion.split('.')[0];
    version = `${electronVersion}.0.0`;
}
else{
    version = `${electronVersion}.0.0`;
}

if(Number(electronVersion) < 29){
    console.error('Electron version 29 or higher is required');
    process.exit(1);
}

function deleteBuildDir() {

    const buildDir = path.join(__dirname, '..', 'build');

    if (fs.existsSync(buildDir)) {
        console.log();
        console.log(`Removing build directory: ${buildDir}`);
        fs.rmSync(buildDir, { recursive: true, force: true });
    }
}

function findNodeGyp() {

    if(nodeGyp){
        return nodeGyp;
    }
        
    try {
        console.log();
        console.log('Locating node-gyp...');
        let result = execSync('npm config get prefix').toString().trim();
        if (fs.existsSync(result)) {
            nodeGyp = path.join(result, 'node_modules', 'node-gyp', 'bin', 'node-gyp.js');
            console.log(`Found node-gyp at ${nodeGyp}`);
            return nodeGyp;
        }
        else{
            console.error();
            console.error('node-gyp not found');
            process.exit(1);
        }
    } catch (err) {
        throw err;
    }   
}

function fixArmBuild() {
    const files = fs.readdirSync(path.join(__dirname, '..', 'build'));
    for (const file of files) {
        if (path.extname(file) === '.vcxproj') {
            const filePath = path.join(__dirname, '..', 'build', file);
            console.log(`Patching ${filePath} for arm64...`);
            let data = fs.readFileSync(filePath, 'utf8');
            data = data.replace(/<FloatingPointModel>Strict<\/FloatingPointModel>/g, '<!-- <FloatingPointModel>Strict</FloatingPointModel> -->');
            fs.writeFileSync(filePath, data, 'utf8');
        }
    }
}

function fixElectron32Build() {
    const files = fs.readdirSync(path.join(__dirname, '..', 'build'));
    for (const file of files) {
        if (path.extname(file) === '.vcxproj') {
            const filePath = path.join(__dirname, '..', 'build', file);
            console.log(`Patching ${filePath} for Electron 32 c++ error...`);
            let data = fs.readFileSync(filePath, 'utf8');
            data = data.replace(/std:c\+\+17/g, 'std:c++20');
            fs.writeFileSync(filePath, data, 'utf8');
        }
    }
}

function build(arch) {

    try {
        deleteBuildDir()
        console.log();
        console.log(`Building electron-edge-js ${process.platform}-${arch} for Electron ${electronVersion}...`);
        findNodeGyp();
        console.log();
        execSync(`node "${nodeGyp}" configure --target=${version} --arch=${arch} --runtime=electron --disturl=https://electronjs.org/headers --release`, { stdio: 'inherit' });
        if(arch === 'arm64' && process.platform === 'win32'){
            console.log();
            fixArmBuild();
            console.log();
        }
        if(Number(electronVersion) == 32 && process.platform === 'win32'){
            console.log();
            fixElectron32Build();
            console.log();
        }
        execSync(`node "${nodeGyp}" build`, { stdio: 'inherit' });
        console.log();
        console.log('Build completed successfully');
    } catch (err) {
        console.error();
        console.error('Build failed');
        console.error(err);
        process.exit(1);
    }
}

function copyBuildOutput(arch) {
    const buildDir = path.join(__dirname, '..', 'build', 'Release');
    const outputDir = path.join(__dirname, '..', 'lib', 'native', process.platform, arch, electronVersion);

    console.log(`Copying built binaries from ${buildDir} to ${outputDir}...`);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const files = fs.readdirSync(buildDir);
    for (const file of files) {
        if (path.extname(file) === '.node' || path.extname(file) === '.exe') {
            fs.copyFileSync(path.join(buildDir, file), path.join(outputDir, file));
            console.log(`Copied ${file} to ${outputDir}`);
        }
    }
    console.log(`Completed copying built binaries from ${buildDir} to ${outputDir}`);
}

function buildAll() {
    if(process.platform === 'linux'){
        build(process.arch);
    }
    else if(process.platform === 'darwin'){
        // On macOS, build only for the current architecture as universal builds are not supported
        build(process.arch);
        console.log();
        copyBuildOutput(a);
        deleteBuildDir();
    }
    else if(process.platform === 'win32'){
        for (const a of arch) {
            build(a);
            console.log();
            copyBuildOutput(a);
            deleteBuildDir();
        } 
    }
    else{
        console.error(`Unsupported platform: ${process.platform}`);
        process.exit(1);
    }
    console.log();
    console.log('All builds completed successfully');
}

buildAll();
