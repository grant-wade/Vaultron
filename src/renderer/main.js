/** ================================================= //
// JavaScript file that deals with main.html function //
// ================================================== */

// ====================== //
// Import needed packages //
// ====================== //
const ipc = require('electron').ipcRenderer;

// ===================================== //
// On quit button click send quit signal //
// ===================================== //
$('#quit-app').click(() => {
    ipc.send('shutdown');
});


// ========================================== //
// Pulls Data into dataSet from profiles file //
// ========================================== //




//===========//
// DataTable //
//===========//

function dataTableUpdate() {
    ipc.send('getProfile');  
}

ipc.on('returnProfile', function(event, profile) {
    var dataSet = [];
    for (var i in profile.vault) {
        console.log(i);
        console.log(profile.vault[i])
        dataSet.push([profile.vault[i].website, profile.vault[i].username, profile.vault[i].password])
    } 
    console.log(profile);
    console.log(dataSet);
    $('#passwords').DataTable( {
        data: dataSet,
        "scrollY":        "700px",
        "scrollCollapse": true,
        "paging":         false,
        columns: [
            { title: "Website" },
            { title: "Username" },
            { title: "Password" },
        ]
    });
});


// Uses Jquery to allow table to be sorted and scrollable
$(document).ready(function() {
    dataTableUpdate();
});

/* Script for generating cryptographically secure random passwords */
console.log('passwords generator');
$('#pass_gen').click(() => {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;
    let win_size = 1500;
    const win = new BrowserWindow({
        frame: true, // removes chrome frame on all platforms
        resizable: false, // makes sure window cannot be resized
        width: win_size * 0.45,
        height: win_size * 0.5,
    });
    win.loadURL(`file://${__dirname}/../renderer/pass_gen.html`);
});


/* created the new entry window */
$('#new_entry').click(() => {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;
    let win_size = 1500;
    const win = new BrowserWindow({
        frame: true,
        resizable: false,
        width: win_size * 0.45,
        height: win_size * 0.5
    });
    win.loadURL(`file://${__dirname}/../renderer/new_entry.html`);
    win.on('closed', () => {
        win = null
    });
});



