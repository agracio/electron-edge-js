@echo off
set SELF=%~dp0
if "%1" equ "" (
    echo Usage: build.bat debug^|release "{version}"
    echo e.g. build.bat release "30.0.0"
    exit /b -1
)
rmdir /S /Q ..\build\
FOR /F "tokens=* USEBACKQ" %%F IN (`node -p process.arch`) DO (SET ARCH=%%F)

SET FLAVOR=%1
shift
if "%FLAVOR%" equ "" set FLAVOR=release
SET DESTDIRROOT=%SELF%\..\lib\native\win32

set VERSION=%1

pushd %SELF%\..

call :build ia32 ia32 %VERSION%
call :build x64 x64 %VERSION%
call :build arm64 arm64 %VERSION%

popd

exit /b 0

:build


set ELECTRONV=%3
set "ELECTRONV=%ELECTRONV:~,2%"

set DESTDIR=%DESTDIRROOT%\%1\%3
if not exist "%DESTDIR%\NUL" mkdir "%DESTDIR%"

:gyp

echo Building edge.node %FLAVOR% for node.js %2 %3

FOR /F "tokens=* USEBACKQ" %%F IN (`npm config get prefix`) DO (SET NODEBASE=%%F)
set GYP=%NODEBASE%\node_modules\node-gyp\bin\node-gyp.js
if not exist "%GYP%" (
    echo Cannot find node-gyp at %GYP%. Make sure to install with npm install node-gyp -g
    exit /b -1
)

node "%GYP%" configure --msvs_version=2022 --target=%3 --arch=%2 --runtime=electron --disturl=https://electronjs.org/headers --%FLAVOR%
if %ERRORLEVEL% neq 0 (
    echo Error building edge.node %FLAVOR% for node.js %2 v%target%
    exit /b -1
)

@REM Conflict when building arm64 binaries
if "%2" == "arm64" (
    FOR %%F IN (build\*.vcxproj) DO (
    echo Patch /fp:strict in %%F
    powershell -Command "(Get-Content -Raw %%F) -replace '<FloatingPointModel>Strict</FloatingPointModel>', '<!-- <FloatingPointModel>Strict</FloatingPointModel> -->' | Out-File -Encoding Utf8 %%F"
    )
)

@REM Conflict when building Electron v32
if %ELECTRONV% EQU 32 (
    FOR %%F IN (build\*.vcxproj) DO (
        echo Replace std:c++17 with std:c++20 in %%F
        powershell -Command "(Get-Content -Raw %%F) -replace 'std:c\+\+17', 'std:c++20' | Out-File -Encoding Utf8 %%F"
    )
)

node "%GYP%" build

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
