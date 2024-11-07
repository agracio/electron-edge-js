const spawn = require('child_process').spawn
const existsSync = require('fs').existsSync
const nanPath = existsSync('./node_modules/nan/nan.h') ? './node_modules/nan/nan.h' : '../nan/nan.h'
if (process.platform === 'win32') {
    spawn('powershell', ['-Command', `(Get-Content -Raw ${nanPath}) -replace '#include \"nan_scriptorigin.h\"', '// #include \"nan_scriptorigin.h\"' | Out-File -Encoding Utf8 ${nanPath}`], { stdio: 'inherit' })
} else {
    spawn('sed', ['-i', '-e', 's/^#include .nan_scriptorigin\\.h./\\/\\/ #include nan_scriptorigin.h/', nanPath], { stdio: 'inherit' })
}