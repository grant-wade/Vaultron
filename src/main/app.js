'use strict';
const electron = require('electron');
const app = electron.app;
const security = require('./security.js');
const ipc = require('electron').ipcMain;
const fileio = require('./fileio.js');

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let mainWindow;
let userData = app.getPath('userData');
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

	win.loadURL(`file://${__dirname}/../renderer/login.html`);
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
let masterKey;
let passwordHash;


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
	fileio.profileExist(userData, args[0], (err, val) => {
		if (val) return event.sender.send("profileCreateFail", "Profile Exists");

		security.generateMasterKey((err, masterKey) => {
			if (err) return event.sender.send('profileCreateFail', "Key Generation Error");

			security.hashPasswordAuth(args[1], (err, passObj) => {
				if (err) return event.sender.send('profileCreateFail', "Hashing Password Error");

				security.hashPassword(args[1], passObj, (err, hash) => {
					if (err) return event.sender.send('profileCreateFail', "Hashing Password Error");

					security.encrypt(masterKey, hash, (err, keyObj) => {
						if (err) return event.sender.send('profileCreateFail', "Encryption Error");

						fileio.createProfile(app.getPath('userData'), args[0], passObj, keyObj, (worked) => {
							mainWindow.loadURL(`file://${__dirname}/../renderer/login.html`);
						});
					});
				});
			});
		});
	});
});


ipc.on('getPath', function (event, arg) {
	event.sender.send('getPathReply', app.getPath('userData'));
});

ipc.on('newEntry', function (event, entry) {
	security.encrypt(entry.password, masterKey, (err, passObj) => {
		entry.password = passObj;
		fileio.addEntry(userData, currentProfile, entry, (err, result) => {
			if (err) {
				return event.sender.send('newEntryFail');
			}
			if (!result) {
				return event.sender.send('newEntryFail');
			}
			mainWindow.loadURL(`file://${__dirname}/../renderer/main.html`);
		});
	});
});

ipc.on('getProfile', (event) => {
	security.decryptProfile(currentProfile, masterKey, (err, profile) => {
		event.sender.send('returnProfile', profile);
	});
})


// =============================================== //
// On ipc call checkPassword check passed password //
// against stored password hash.                   //
// =============================================== //
ipc.on('checkPassword', function (event, args) {
	fileio.getProfile(userData, args[0], (err, profile) => {
		security.verifyPassword(args[1], profile.details.password, (err, result) => {
			console.log(result);
			if (!result) {
				return event.sender.send("badPassword")
			}
			currentProfile = profile;
			security.hashPassword(args[1], profile.details.password, (err, hash) => {
				if (err) return event.sender.send("badPassword");
				passwordHash = Buffer.from(hash, 'base64');
				security.decrypt(profile.details.masterKey, hash, (err, key) => {
					if (err) return event.sender.send("badPassword");
					masterKey = Buffer.from(key, 'base64');
					mainWindow.loadURL(`file://${__dirname}/../renderer/main.html`);
				});
			});	
		});
	});
});