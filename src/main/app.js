'use strict';
const electron = require('electron');
const app = electron.app;
const security = require('./security.js')
const ipc = require('electron').ipcMain; 
const fileio = require('./fileio.js')


// const remote = require('electron').remote; //idk if we need this

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let mainWindow;
let win_size = 1500;


function onClosed() {
	// Dereference the window
	// For multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		frame: true,	  // removes chrome frame on all platforms
		resizable: true,  // makes sure window cannot be resized
		width: win_size*0.8,
		height: win_size*0.65,
	});
	
	win.loadURL(`file://${__dirname}/../renderer/login.html`);
	win.on('closed', onClosed);
	return win;
}

// change the main window to accomodate the main app rather then login
// function change_window(toWindow){
// 	if (toWindow == "login"){
// 		console.log('changing to login window');
// 	}
// 	else if (toWindow == "main"){
// 		console.log('changing to main window');
// 	}
// }

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// app.on('activate', () => {
// 	if (!mainWindow) {
// 		mainWindow = createMainWindow();
// 	}
// });


app.on('ready', () => {
	mainWindow = createMainWindow();

	// fileio.getProfiles(app.getPath('userData'), (err, profiles) => {
	// 	if (typeof profiles === 'undefined') {
	// 		newProfile()
	// 	} else {
	// 		console.log("made it");
			
	// 		for (var i = 0; i < profiles.length; i++) {
	// 			console.log(profiles[i]);

	// 		}
	// 	}
	// });
});

function newProfile() {
	mainWindow.loadURL(`file://${__dirname}/../renderer/new_user.html`)
}



ipc.on('shutdown', function(){
    app.quit();
});


ipc.on('getProfiles', (event) => {
	fileio.getProfiles(app.getPath('userData'), (err, profiles) => {
		if (typeof profiles === 'undefined') {
			newProfile()
		} else {
			// console.log("made it");
			for (var i = 0; i < profiles.length; i++) {
				// console.log(profiles[i]);
			}
			event.sender.send('getProfilesReply', profiles);
		}
	});
})


ipc.on('newProfile', (event, args) => {
	security.generateMasterKey((err, masterKey) => {
		security.hashPassword(args[1], (err, buf) => {
			if (err) {
				ipc.send('profileCreateFail', err);
			}
			fileio.createProfile(app.getPath('userData'), args[0], buf.toString('base64'), masterKey.toString('base64'), (worked) => {
				mainWindow.loadURL(`file://${__dirname}/../renderer/login.html`)
			})
		})
	})
})


ipc.on('getPath', function (event, arg) {
	event.sender.send('getPathReply', app.getPath('userData'))
})


ipc.on('checkPassword', function (event, arg) {
	
})