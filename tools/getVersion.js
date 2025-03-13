const fs = require("fs");
const http = require('isomorphic-git/http/web');
const git = require("isomorphic-git");

// const majors = [30, 31, 32, 33, 34, 35, 36];
const majors = [30];
const oses = ['macos-13', 'macos-15', 'ubuntu-22.04', 'ubuntu-22.04-arm', 'windows-2022'];
// const oses = ['macos-13', 'macos-15', 'windows-2022'];

git.getRemoteInfo({
    http,
    //corsProxy: "https://cors.isomorphic-git.org",
    url: "https://github.com/electron/electron"
}).then(info =>{
    let tags = Object.keys(info.refs.tags);
    let major = process.argv[2];

    if(major){
        let version = getVersion(tags, major);

        if(version){
            fs.writeFileSync('electron.txt', version);
            console.log(version);
        }
    }
    else{
        let versions = [];
        let results = [];
    
        majors.forEach((major) => {
            let version = getVersion(tags, major);
            if(version){
                versions.push(getVersion(tags, major));
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

});

function getVersion(tags, major){
    let tag = tags
    .filter(function (str) { return !str.includes('^'); })
    .filter(function (str) { return !str.includes('-'); })
    .filter(function (str) { return str.startsWith(`v${major}.`); })
    .sort()
    .reverse();

    if(tag.length !== 0){
        return tag[0].replace('v', '')
    }
    else{
        console.log(`Unable to resolve latest version for Electron ${major}`)
        return null;
    }
}


