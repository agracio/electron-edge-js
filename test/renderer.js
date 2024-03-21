const path = require('path');
const Mocha = require('mocha');
const merge  = require('mochawesome-merge');

//var frameworks = process.platform === 'win32' ? ['', '1'] : ['1']

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
};

function addFiles(mocha){
  mocha.addFile(path.join(__dirname, '101_edge_func.js'))
  mocha.addFile(path.join(__dirname, '102_node2net.js'))
  mocha.addFile(path.join(__dirname, '103_net2node.js'))
  mocha.addFile(path.join(__dirname, '104_csx.js'))
  mocha.addFile(path.join(__dirname, '105_node2net_sync.js'))
  mocha.addFile(path.join(__dirname, '201_patterns.js'))
  mocha.addFile(path.join(__dirname, '202_serialization.js'))

}


function addTestSuite(suiteName, suiteFile, testNumber, margin, prefix){
    var html= `
      <header class="suite--header---TddSn" style="margin-top: ${margin}px;">
      <h3 class="suite--title---3T6OR">
          <!--<span id="suiteName">[${prefix}] ${suiteName}</span>-->
          <span id="suiteName">${suiteName}</span>
          <li class="suite-summary--summary-item---JHYFN suite-summary--tests---3Zhct" title="Tests"><i class="material-icons md-18 suite-summary--icon---3rZ6G"></i><span id="suiteTestNumber">${testNumber}</span></li>
      </h3>
      <h6 class="suite--filename---1u8oo" id="suiteFile">${suiteFile}</h6>
      </header>
    `;

    return html;
  }

  window.onload = function() {

    // var framework = frameworks.shift();
    // runTests(framework);
    runTests(process.env.EDGE_USE_CORECLR);
    function runTests(framework){

      //if (typeof framework === "undefined") return;

      //process.env.EDGE_USE_CORECLR = framework;
      var version = process.env.EDGE_USE_CORECLR ? 'CoreCLR' : process.platform === 'win32' ? '.NET Framework 4.5' : 'Mono Framework';
      //var prefix = process.env.EDGE_USE_CORECLR ? 'CoreCLR' : 'NET';
      var prefix = '';

      document.getElementById("title").innerHTML = `Running ${version} tests on Electron ${process.versions.electron}`;
    
      var reportFilename = `${prefix}test-results.html`;
      var mocha = createMocha(reportFilename, version);
      addFiles(mocha);
    
      var suitesDoc = document.getElementById("suites")
  
      var run = mocha.run();
      document.getElementById("testsNumber").innerHTML = run.total;
    
      var margin = 0;
      run.on('suite', function(suite){
        if(suite.file){
          suitesDoc.innerHTML += addTestSuite(suite.title, suite.file.replace(/^.*[\\/]/, ''), suite.tests.length, margin, prefix)
          margin = 10;
        }
      });
  
      run.on('end', function(){
          setTimeout(function(){
            console.log('end');
            mocha.dispose();
            //window.location.reload()
            window.location.replace(`mochawesome-report/${reportFilename}`);

            //window.location.href = 'mochawesome-report/testResults.html';

            // var val = frameworks.shift()
            // if (typeof val === "undefined"){

            // }
            // else{
            //   
            //     delete require.cache[require.resolve('../lib/edge.js')]
            //     runTests(val);

              
            // }
          }, 1000);
      });

    }
    
    // function mergeReports(){

    // }

  }

