const spawn = require('child_process').spawn

if (process.platform === 'win32') {
    spawn('powershell', ['-Command', "(Get-Content -Raw ./node_modules/nan/nan.h) -replace '#include \"nan_scriptorigin.h\"', '// #include \"nan_scriptorigin.h\"' | Out-File -Encoding Utf8 ./node_modules/nan/nan.h"], { stdio: 'inherit'})
}else{
    spawn('sed', ['-i', '-e', 's/^#include .nan_scriptorigin\\.h./\\/\\/ #include nan_scriptorigin.h/', './node_modules/nan/nan.h'], { stdio: 'inherit'})
}


