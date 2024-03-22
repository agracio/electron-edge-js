/*jshint esversion: 6 */
const { ipcMain, ipcRenderer} = require("electron");
const path = require('path');
const Mocha = require('mocha');
const merge  = require('mochawesome-merge');

const baseNetAppPath = path.join(__dirname, '/bin/Debug/netcoreapp3.1/');

process.env.EDGE_APP_ROOT = baseNetAppPath;

function createMocha (reportFilename, version) {
  return new Mocha({
    reporter: 'mochawesome',
    reporterOptions: {
      reportFilename: reportFilename,
      reportDir: path.join(__dirname, 'mochawesome-report'),
      quiet: false,
      consoleReporter: 'none',
      showSkipped: true,
      json: false,
      reportTitle: 'electron-edge-js ' + version
    },
    timeout:10000,
  });
}

function addFiles(mocha){
  mocha.addFile(path.join(__dirname, '101_edge_func.js'));
  mocha.addFile(path.join(__dirname, '102_node2net.js'));
  mocha.addFile(path.join(__dirname, '103_net2node.js'));
  mocha.addFile(path.join(__dirname, '104_csx.js'));
  mocha.addFile(path.join(__dirname, '105_node2net_sync.js'));
  mocha.addFile(path.join(__dirname, '201_patterns.js'));
  mocha.addFile(path.join(__dirname, '202_serialization.js'));

}

exports.runTests = function (framework, window){

    //if (typeof framework === "undefined") return;

    //process.env.EDGE_USE_CORECLR = framework;
    var version = process.env.EDGE_USE_CORECLR ? 'CoreCLR' : process.platform === 'win32' ? '.NET Framework 4.5' : 'Mono Framework';
    //var prefix = process.env.EDGE_USE_CORECLR ? 'CoreCLR' : 'NET';
    var prefix = '';

    //ipcRenderer.send("testResult", 'title', `Running ${version} tests on Electron ${process.versions.electron}`);
    window.webContents.send("testResult", 'title', `Running ${version} tests on Electron ${process.versions.electron}`);
  
    var reportFilename = `${prefix}test-results.html`;
    var mocha = createMocha(reportFilename, version);
    addFiles(mocha);
  
    var run = mocha.run();
    window.webContents.send("testResult", 'testsNumber', run.total);
  
    var margin = 0;
    run.on('suite', function(suite){
      if(suite.file){
          window.webContents.send("testResult", 'suites', '', suite.title, suite.file.replace(/^.*[\\/]/, ''), suite.tests.length, margin, prefix);
        margin = 10;
      }
    });

    run.on('end', function(){
        setTimeout(function(){
          console.log('end');
          mocha.dispose();
          window.webContents.send("runComplete", reportFilename);
        }, 1000);
    });

  };

  // ipcMain.on("runTests", (event, args) => {
  //   console.log(ipcRenderer);
  //   runTests(process.env.EDGE_USE_CORECLR, args);
  // });

//   exports.run = function (window) {
//       ipcMain.handle("run", (event, args) =>{
//           runTests(process.env.EDGE_USE_CORECLR, window);
//   });
//  };
