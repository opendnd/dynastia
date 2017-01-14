const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path'),
      url  = require('url'),
      fs   = require('fs'),
      pdf  = require('html-pdf');

// load from within the directory if debugging or get from node modules
if (process.env.DYNASTIA_DEBUG) {
  rootDir = path.join(__dirname, '..');  
  libDir  = path.join(rootDir, 'lib');
} else {
  rootDir = path.join(__dirname, '.'),
  libDir  = path.join(rootDir, 'node_modules', 'dynastia', 'lib'); 
}

// load dynastia modules
var Generator = require(path.join(libDir, 'generator')),
    Renderer  = require(path.join(libDir, 'renderer'));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  var debugWidth = 0;
  if (process.env.DYNASTIA_DEBUG) {
    debugWidth = 450;
  }

  // Create the browser window.
  win = new BrowserWindow({ 
    width: 1024 + debugWidth, 
    height: 742, 
    minWidth: 1024, 
    minHeight: 742, 
    backgroundColor: '#000000' 
  });

  // Open the DevTools.
  if (process.env.DYNASTIA_DEBUG) {
    win.webContents.openDevTools();
  }

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});

ipcMain.on('generate', (event, arg) => {
  Generator.themeName = arg.theme;

  let dynasty = Generator.generate({
    year        : arg.year, 
    gender      : 'male', 
    generations : arg.generations
  });
  
  event.returnValue = dynasty;
})

ipcMain.on('pdf', (event, arg) => {
  let options = { format: 'Letter' };

  dialog.showSaveDialog(function (fileName) {
    if (fileName === undefined) return;

    // add pdf extension
    if (fileName.indexOf('.pdf') < 0) {
      fileName += '.pdf';
    }

    Renderer.renderDynasty('', arg.dynasty, true, function (html) {
      // add extra html
      var pdfHTML = '<html><head><title>Dynastia</title></head><body>' +
                    '<h1>Your Dynasty</h1><div id="content">' + html + '</div>' +
                    '</body></html>';

      pdf.create(pdfHTML, options).toFile(fileName, function(err, res) {
        dialog.showMessageBox(win, {
          title: 'Success',
          message: 'Your PDF has been successfully saved'
        });
      });
    });
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.