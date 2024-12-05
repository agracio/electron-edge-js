const fs = require("fs");
const http = require('isomorphic-git/http/web');
const git = require("isomorphic-git");


    git.getRemoteInfo({
        http,
        //corsProxy: "https://cors.isomorphic-git.org",
        url: "https://github.com/electron/electron"
    }).then(info =>{
        let result = Object.keys(info.refs.tags);
        result = result
            .filter(function (str) { return !str.includes('^'); })
            .filter(function (str) { return !str.includes('-'); })
            .filter(function (str) { return str.startsWith(`v${process.argv[2]}.`); })
            .sort()
            .reverse();

        if(result.length !== 0){
            let version = result[0].replace('v', '')
            fs.writeFileSync('electron.txt', version);
            console.log(version);
        }
        else{
            throw `Unable to resolve latest version for Electron ${process.argv[2]}`
        }
    });


