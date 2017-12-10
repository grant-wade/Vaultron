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


// Global profile variables
let currentProfile;
let masterKey;
let passwordHash;



// Get all profiles for login window
ipc.on('getProfiles', (event) => {
	fileio.getProfiles(app.getPath('userData'), (err, profiles) => {
		if (typeof profiles === 'undefined') {
			newProfile();
		} else {
			event.sender.send('getProfilesReply', profiles);
		}
	});
})

// Create a new profile
ipc.on('newProfile', (event, args) => {
	// check if profile exists
	fileio.profileExist(userData, args[0], (err, val) => {
		if (val) return event.sender.send("profileCreateFail", "Profile Exists");
		// generate a master key for the profile
		security.generateMasterKey((err, masterKey) => {
			if (err) return event.sender.send('profileCreateFail', "Key Generation Error");
			// hash the password for storage
			security.hashPasswordAuth(args[1], (err, passObj) => {
				if (err) return event.sender.send('profileCreateFail', "Hashing Password Error");
				// get password used for hashing
				security.hashPassword(args[1], passObj, (err, hash) => {
					if (err) return event.sender.send('profileCreateFail', "Hashing Password Error");
					// encrypt master key for storage
					security.encrypt(masterKey, hash, (err, keyObj) => {
						if (err) return event.sender.send('profileCreateFail', "Encryption Error");
						// create profile with encrypted 
						fileio.createProfile(app.getPath('userData'), args[0], passObj, keyObj, (worked) => {
							mainWindow.loadURL(`file://${__dirname}/../renderer/login.html`);
						});
					});
				});
			});
		});
	});
});

// get user application directory
ipc.on('getPath', function (event, arg) {
	event.sender.send('getPathReply', app.getPath('userData'));
});


// Create a new entry in the current profile
ipc.on('newEntry', function (event, entry) {
	// encrypt password
	security.encrypt(entry.password, masterKey, (err, passObj) => {
		entry.password = passObj;
		// add entry to profile
		fileio.addEntry(userData, currentProfile, entry, (err, result) => {
			if (err) {
				return event.sender.send('newEntryFail');
			}
			if (!result) {
				return event.sender.send('newEntryFail');
			}
			// return to main window
			mainWindow.loadURL(`file://${__dirname}/../renderer/main.html`);
		});
	});
});


// get current profile
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
	// get profile for login
	fileio.getProfile(userData, args[0], (err, profile) => {
		// verify that passwords matches
		security.verifyPassword(args[1], profile.details.password, (err, result) => {
			console.log(result);
			if (!result) {
				return event.sender.send("badPassword")
			}
			currentProfile = profile;
			// hash password for decryption use
			security.hashPassword(args[1], profile.details.password, (err, hash) => {
				if (err) return event.sender.send("badPassword");
				passwordHash = Buffer.from(hash, 'base64');
				// decrypt master key for password decyption
				security.decrypt(profile.details.masterKey, hash, (err, key) => {
					if (err) return event.sender.send("badPassword");
					masterKey = Buffer.from(key, 'base64');
					mainWindow.loadURL(`file://${__dirname}/../renderer/main.html`);
				});
			});	
		});
	});
});