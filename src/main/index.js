// Modules to control application life and create native browser window
const {app, ipcMain, Menu, BrowserWindow} = require('electron');
const path = require('path');

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('UnSRT', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('UnSRT');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow();

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
       createWindow();
      }
    });
  });
  
  app.on('open-url', (event, url) => {
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`);
  });
}


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    icon: path.join(__dirname, '../images', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true, // 页面直接使用node的能力
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });


  require(path.join(__dirname, 'menu.js'));

  // and load the index.html of the app.
  if (process.env.IS_DEV) {
    mainWindow.loadURL('http://localhost:4500');
  } else {
    mainWindow.loadFile(`${path.join(__dirname, '../render/dist/index.html')}`);
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  require(path.join(__dirname, 'main.js'));

}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Handle window controls via IPC
ipcMain.on('shell:open', () => {
  const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked');
  const pagePath = path.join('file://', pageDirectory, 'index.html');
  shell.openExternal(pagePath);
})
