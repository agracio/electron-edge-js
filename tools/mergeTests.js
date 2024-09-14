const path = require('path');
const fs = require('fs');
const merge = require('mochawesome-merge');
const marge = require('mochawesome-report-generator')

const options = {
    files: [
        './test/mochawesome-report/*.json',
    ],
}

const margeOptions = {
    reportFilename: 'mochawesome.html',
    reportDir: './test/mochawesome-report'
}
  
marge.merge(options).then(report => {
    var file = './test/mochawesome-report/mochawesome.json';
    fs.writeFileSync(file, JSON.stringify(report, null, 2))
    console.log(`Mochawesome json created: ${file}`);
    marge.create(report, margeOptions).then(() => console.log(`Mochawesome report created: ${margeOptions.reportDir}/${margeOptions.reportFilename}`))

})
