'use strict';
const electron = require('electron');
const app = electron.app;
const security = require('./security.js')
const ipc = require('electron').ipcMain;
const fileio = require('./fileio.js')

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
		frame: true, // removes chrome frame on all platforms
		resizable: true, // makes sure window cannot be resized
		width: win_size * 0.8,
		height: win_size * 0.65,
	});

	win.loadURL(`file://${__dirname}/../renderer/main.html`);
	win.on('closed', onClosed);
	return win;
}


app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});


app.on('ready', () => {
	mainWindow = createMainWindow();
});

function newProfile() {
	mainWindow.loadURL(`file://${__dirname}/../renderer/new_user.html`)
}


ipc.on('shutdown', function () {
	app.quit();
});


let currentProfile;


ipc.on('getProfiles', (event) => {
	fileio.getProfiles(app.getPath('userData'), (err, profiles) => {
		if (typeof profiles === 'undefined') {
			newProfile();
		} else {
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
			fileio.createProfile(app.getPath('userData'), args[0], buf, masterKey, (worked) => {
				mainWindow.loadURL(`file://${__dirname}/../renderer/login.html`);
			});
		});
	});
});


ipc.on('getPath', function (event, arg) {
	event.sender.send('getPathReply', app.getPath('userData'));
});


// =============================================== //
// On ipc call checkPassword check passed password //
// against stored password hash.                   //
// =============================================== //
ipc.on('checkPassword', function (event, args) {
	fileio.getProfile(app.getPath('userData'), args[0], (err, profile) => {
		console.log("begin");
		var res = security.verifyPassword(args[1], profile.details.password, (err, result) => {
			console.log("checking");
			if (result) {
				console.log("good user!");
				currentProfile = profile;
				mainWindow.loadURL(`file://${__dirname}/../renderer/main.html`);
			} else {
				event.sender.send("badPassword")
			}
		});
		console.log(res);
	});
});