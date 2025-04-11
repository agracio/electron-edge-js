process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
if(process.platform === 'linux' && !process.env.EDGE_USE_CORECLR){ 
  Object.assign(process.env, { 
      // Work around Mono problem: undefined symbol: mono_add_internal_call_with_flags 
      LD_PRELOAD: 'libmono-2.0.so libmonosgen-2.0.so libstdc++.so.6', 
  }); 
} 
const {app, BrowserWindow, ipcMain, ipcRenderer} = require("electron");
const testRunner = require('./app.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences:{
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      preload: `${__dirname}/preload.js`,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html?platform=${process.platform}&useClr=${process.env.EDGE_USE_CORECLR}`);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {
    app.quit();
  //}
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("runTests", (event, args) => {
  // if (typeof args !== "undefined"){
  //   process.env.EDGE_USE_CORECLR = args;
  // }
  testRunner.runTests(args, mainWindow);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
