const fs = require("fs");
const http = require('isomorphic-git/http/web');
const git = require("isomorphic-git");
const { get } = require("https");

const majors = [29, 30, 31, 32, 33, 34];

git.getRemoteInfo({
    http,
    //corsProxy: "https://cors.isomorphic-git.org",
    url: "https://github.com/electron/electron"
}).then(info =>{
    let result = Object.keys(info.refs.tags);
    let oses = ['macos-13', 'macos-14', 'ubuntu-22.04', 'ubuntu-22.04-arm', 'windows-2022'];
    let versions = [];
    majors.forEach((major) => {
        
        oses.forEach((os) => {
            versions.push({'electron': getVersion(result, major), 'os': `${os}`});
        });
    });
    let res = `{'include':${JSON.stringify(versions)}}`
    fs.writeFileSync('electron-versions.txt', res);
    console.log(res);
});

function getVersion(result, major){
    result = result
    .filter(function (str) { return !str.includes('^'); })
    .filter(function (str) { return !str.includes('-'); })
    .filter(function (str) { return str.startsWith(`v${major}.`); })
    .sort()
    .reverse();

    if(result.length !== 0){
        return result[0].replace('v', '')      
    }
    else{
        throw `Unable to resolve latest version for Electron ${major}`
    }

}



