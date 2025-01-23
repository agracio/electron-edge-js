const fs = require("fs");
const http = require('isomorphic-git/http/web');
const git = require("isomorphic-git");

const majors = [29, 30, 31, 32, 33, 34];

git.getRemoteInfo({
    http,
    //corsProxy: "https://cors.isomorphic-git.org",
    url: "https://github.com/electron/electron"
}).then(info =>{

    let tags = Object.keys(info.refs.tags);
    let oses = ['macos-13', 'macos-14', 'ubuntu-22.04', 'ubuntu-22.04-arm', 'windows-2022'];
    let versions = [];
    let results = [];

    majors.forEach((major) => {
        versions.push(getVersion(tags, major));
    });

    oses.forEach((os) => {
        versions.forEach((version) => {
            results.push({'electron': `${version}`, 'os': `${os}`});
        });
    });

    let res = `{'include':${JSON.stringify(results)}}`
    fs.writeFileSync('electron-versions.txt', res);
    console.log(res);
});

function getVersion(tag, major){
    tag = tag
    .filter(function (str) { return !str.includes('^'); })
    .filter(function (str) { return !str.includes('-'); })
    .filter(function (str) { return str.startsWith(`v${major}.`); })
    .sort()
    .reverse();

    if(tag.length !== 0){
        return tag[0].replace('v', '')      
    }
    else{
        throw `Unable to resolve latest version for Electron ${major}`
    }
}



