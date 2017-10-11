'use strict';
const electron = require('electron');
const remote = require('electron').remote;
const app = electron.app;
var ipc = require('electron').ipcMain; 

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let mainWindow;
let win_size = 1100;


function onClosed() {
	// Dereference the window
	// For multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		frame: false,	  // removes chrome frame on all platforms
		resizable: false, // makes sure window cannot be resized
		width: win_size*0.6,
		height: win_size*0.45
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);
	return win;
}

// change the main window to accomodate the main app rather then login
function change_window(toWindow){
	if (toWindow == "login"){
		console.log('changing to login window');
	}
	else if (toWindow == "main"){
		console.log('changing to main window');
	}
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});

/* Close App
close main window on call
Author: robby


function close_app(){
	let w = remote.getCurrentWindow();
	w.close();
}
*/
ipc.on('shutdown', function(){
    app.quit();
});


