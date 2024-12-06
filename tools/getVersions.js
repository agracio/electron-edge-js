const fs = require("fs");
const http = require('isomorphic-git/http/web');
const git = require("isomorphic-git");
const { get } = require("https");

const majors = [29, 30, 31, 32, 33];

git.getRemoteInfo({
    http,
    //corsProxy: "https://cors.isomorphic-git.org",
    url: "https://github.com/electron/electron"
}).then(info =>{
    let result = Object.keys(info.refs.tags);
    let versions = [];
    majors.forEach((major) => {
        versions.push(getVersion(result, major));
    });
    let res = `{'include':${JSON.stringify(versions)}}`
    fs.writeFileSync('electron.txt', res);
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
        return {'electron':`${result[0].replace('v', '')}`}
        //fs.writeFileSync('electron.txt', version);
        //console.log(version);
    }
    else{
        throw `Unable to resolve latest version for Electron ${major}`
    }

}



