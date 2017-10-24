// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// var electron = require('electron')
const ipc = require('electron').ipcRenderer;

$('#quit-app').click(() => {
    console.log(document.getElementById("quit-app").name);
    ipc.send('shutdown');
})

ipc.on('getPathReply', (event, arg) => {
    document.getElementById('message').innerHTML = arg
    console.log(arg);
})