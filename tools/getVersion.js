var {http} = require('follow-redirects');
const fs = require("fs");

const majors = [30, 31, 32, 33, 34, 35, 36];
// const majors = [30];
const oses = ['macos-13', 'macos-15', 'ubuntu-22.04', 'ubuntu-22.04-arm', 'windows-2022'];
// const oses = ['ubuntu-22.04', 'ubuntu-22.04-arm'];
getVersion();

function getVersion() {
	let url = 'http://releases.electronjs.org/releases.json';

    function getVersionFromMajor(json, major){
        json = json.filter(function (str) { return str.startsWith(`${major}.`); });
        if(json.length !== 0){
            return json[0];
        }
        else{
            console.warn(`Unable to resolve latest version for Electron ${major}`);
            return null;
        }
    }

	http.get(url,(res) => {
		let body = "";

		if (res.statusCode !== 200) {
			throw new Error(`Unable to get Electron versions from ${url}`);
		}
	
		res.on("data", (chunk) => {
			body += chunk;
		});
	
		res.on("end", () => {
			try {

            let json = JSON.parse(body)
                .sort()
                .map(({ version }) => version)
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
			} catch (error) {
				throw error;
			};
		});
	
	}).on("error", (error) => {
		throw new Error(error);
	});
}
