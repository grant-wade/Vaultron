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
