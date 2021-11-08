@echo off
set SELF=%~dp0
if "%1" equ "" (
    echo Usage: build.bat debug^|release "{version} {version}" ...
    echo e.g. build.bat release "0.8.22 0.10.0"
    exit /b -1
)

SET FLAVOR=%1
shift
if "%FLAVOR%" equ "" set FLAVOR=release
for %%i in (node.exe) do set NODEEXE=%%~$PATH:i
if not exist "%NODEEXE%" (
    echo Cannot find node.exe
    popd
    exit /b -1
)
for %%i in ("%NODEEXE%") do set NODEDIR=%%~dpi
SET DESTDIRROOT=%SELF%\..\lib\native\win32
set VERSIONS=
:harvestVersions
if "%1" neq "" (
    set VERSIONS=%VERSIONS% %1
    shift
    goto :harvestVersions
)
if "%VERSIONS%" equ "" set VERSIONS=0.10.0
pushd %SELF%\..
for %%V in (%VERSIONS%) do call :build ia32 x86 %%V 
for %%V in (%VERSIONS%) do call :build x64 x64 %%V 
popd

exit /b 0

:build

if "%3" equ "2.0.0" (
    SET target=8.9.3
) else if "%3" equ "3.0.0" (
    SET target=10.2.0
) else if "%3" equ "4.0.0" (
    SET target=10.11.0
) else if "%3" equ "5.0.0" (
    SET target=12.0.0
) else if "%3" equ "6.0.0" (
    SET target=12.4.0
) else if "%3" equ "7.0.0" (
    SET target=12.8.1
) else if "%3" equ "8.0.0" (
    SET target=12.13.0
) else if "%3" equ "9.0.0" (
    SET target=12.14.1
) else if "%3" equ "10.0.0" (
    SET target=12.16.3
) else if "%3" equ "11.0.0" (
    SET target=12.18.3
) else if "%3" equ "12.0.0" (
    SET target=14.16.0
) else if "%3" equ "13.0.0" (
    SET target=14.16.0
) else if "%3" equ "15.0.0" (
    SET target=16.5.0
) else (
    echo edge-electron-js does not support Electron %3.
    exit /b -1
)
echo %1
echo %3

set DESTDIR=%DESTDIRROOT%\%1\%3
if exist "%DESTDIR%\node.exe" goto gyp
if not exist "%DESTDIR%\NUL" mkdir "%DESTDIR%"
echo Downloading node.exe %2 %target%...
node "%SELF%\download.js" %2 %target% "%DESTDIR%"
if %ERRORLEVEL% neq 0 (
    echo Cannot download node.exe %2 v%target%
    exit /b -1
)

:gyp

echo Building edge.node %FLAVOR% for node.js %2 v%target%
set NODEEXE=%DESTDIR%\node.exe
FOR /F "tokens=* USEBACKQ" %%F IN (`npm config get prefix`) DO (SET NODEBASE=%%F)
set GYP=%NODEBASE%\node_modules\node-gyp\bin\node-gyp.js
if not exist "%GYP%" (
    echo Cannot find node-gyp at %GYP%. Make sure to install with npm install node-gyp -g
    exit /b -1
)

"%NODEEXE%" "%GYP%" configure build --target=%3 --runtime=electron --dist-url=https://electronjs.org/headers --%FLAVOR%
if %ERRORLEVEL% neq 0 (
    echo Error building edge.node %FLAVOR% for node.js %2 v%target%
    exit /b -1
)

echo %DESTDIR%
copy /y .\build\%FLAVOR%\edge_*.node "%DESTDIR%"
if %ERRORLEVEL% neq 0 (
    echo Error copying edge.node %FLAVOR% for node.js %2 v%target%
    exit /b -1
)
rmdir /S /Q .\build\
copy /y "%DESTDIR%\..\*.dll" "%DESTDIR%"
if %ERRORLEVEL% neq 0 (
    echo Error copying VC redist %FLAVOR% to %DESTDIR%
    exit /b -1
)

echo Success building edge.node %FLAVOR% for node.js %2 v%target%
