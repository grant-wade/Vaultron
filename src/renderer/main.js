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


// Uses Jquery to allow table to be sorted and scrollable
//
$('#passwords').DataTable( {
    "scrollY":        "700px",
    "scrollCollapse": true,
    "paging":         false
} );

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
