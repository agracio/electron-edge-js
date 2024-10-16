@echo off
set SELF=%~dp0
if "%1" equ "" (
    echo Usage: build.bat debug^|release "{version}"
    echo e.g. build.bat release "30.0.0"
    exit /b -1
)
FOR /F "tokens=* USEBACKQ" %%F IN (`node -p process.arch`) DO (SET ARCH=%%F)

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
if "%VERSIONS%" equ "" set VERSIONS=20.14.0
pushd %SELF%\..

if "%ARCH%" == "arm64" (
    for %%V in (%VERSIONS%) do call :build arm64 arm64 %%V 
) else (
    for %%V in (%VERSIONS%) do call :build ia32 x86 %%V 
    for %%V in (%VERSIONS%) do call :build x64 x64 %%V 

)
popd

exit /b 0

:build

if "%3" equ "23.0.0" (
    SET target=18.12.1
) else if "%3" equ "24.0.0" (
    SET target=18.14.0
) else if "%3" equ "25.0.0" (
    SET target=18.15.0
) else if "%3" equ "26.0.0" (
    SET target=18.16.1
) else if "%3" equ "27.0.0" (
    SET target=18.17.1
) else if "%3" equ "28.0.0" (
    SET target=18.18.2
) else if "%3" equ "29.0.0" (
    SET target=20.9.0
) else if "%3" equ "30.0.0" (
    SET target=20.16.0
) else if "%3" equ "31.0.0" (
    SET target=20.17.0
) else if "%3" equ "32.0.0" (
    SET target=20.18.0
) else (
    echo edge-electron-js does not support Electron %3.
    exit /b -1
)
set ELECTRONV=%3
set "ELECTRONV=%ELECTRONV:~,2%"
set NODEV=%target%
set "NODEV=%NODEV:~,2%"

set DESTDIR=%DESTDIRROOT%\%1\%3
@REM if exist "%DESTDIR%\node.exe" goto gyp
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

"%NODEEXE%" "%GYP%" configure --msvs_version=2022 --target=%3 --runtime=electron --dist-url=https://electronjs.org/headers --%FLAVOR% --openssl_fips=''
if %ERRORLEVEL% neq 0 (
    echo Error building edge.node %FLAVOR% for node.js %2 v%target%
    exit /b -1
)

REM Conflict when building arm64 binaries
if "%ARCH%" == "arm64" (
    FOR %%F IN (build\*.vcxproj) DO (
    echo Patch /fp:strict in %%F
    powershell -Command "(Get-Content -Raw %%F) -replace '<FloatingPointModel>Strict</FloatingPointModel>', '<!-- <FloatingPointModel>Strict</FloatingPointModel> -->' | Out-File -Encoding Utf8 %%F"
    )
)

if %ELECTRONV% GEQ 32 (
    if %NODEV% LSS 22 (
        FOR %%F IN (build\*.vcxproj) DO (
            echo Replace std:c++17 with std:c++20 in %%F
            powershell -Command "(Get-Content -Raw %%F) -replace 'std:c\+\+17', 'std:c++20' | Out-File -Encoding Utf8 %%F"
        )
    )
)

"%NODEEXE%" "%GYP%" build

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
