// const params = new URLSearchParams(document.location.search);
// const platform =  params.get('platform');
// const useClr = params.get('useClr');

// console.log(platform)
// console.log(useClr)
//var frameworks = platform === 'win32' ? ['', '1'] : ['1']

var suitesDoc = document.getElementById("suites")
window.api.run();

window.api.receive("fromMain", (documentId, data, suiteName, suiteFile, testNumber, margin, prefix) => {
  if(suiteName){
    document.getElementById(documentId).innerHTML += addTestSuite(suiteName, suiteFile, testNumber, margin, prefix);
  }else{
    document.getElementById(documentId).innerHTML = data;
  }
});

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