const fs = require("fs");
const { execSync } = require('child_process');

const majors = [32, 33, 34, 35, 36, 37];
const oses = ['macos-13', 'macos-15', 'ubuntu-22.04', 'ubuntu-22.04-arm', 'windows-2025', 'windows-11-arm'];

getVersion();

function getVersion() {

    function getVersionFromMajor(json, major){
        const version = json.find((str) =>  str.startsWith(`${major}.`));
        if(version) return version; 
        console.warn(`Unable to resolve latest version for Electron ${major}`);
        return null;
    }

    let json = JSON.parse(execSync('npm view electron versions --json').toString())
    .reverse()
    .filter(function (str) { return !str.includes('^'); })
    .filter(function (str) { return !str.includes('-'); });

    let major = process.argv[2];
    if(major){
        version = getVersionFromMajor(json, major);
        fs.writeFileSync('electron.txt', version);
        console.log(version);
    }
    else{
        let versions = [];
        let results = [];
    
        majors.forEach((major) => {
            let version = getVersionFromMajor(json, major);
            if(version){
                versions.push(version);
            }
        });
    
        oses.forEach((os) => {
            versions.forEach((version) => {
                results.push({'electron': `${version}`, 'os': `${os}`});
            });
        });
    
        let res = `{'include':${JSON.stringify(results)}}`
        fs.writeFileSync('electron-versions.txt', res);
        console.log(versions);
    }
}
