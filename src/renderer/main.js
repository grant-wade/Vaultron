// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


$(function () {

// var electron = require('electron')
const ipc = require('electron').ipcRenderer;

// document.getElementById("quit-app").addEventListener("click", function(e) {
//     console.log(document.getElementById("quit-app").name);
//     ipc.send('shutdown');
// });

$('#quit-app').click(() => {
    console.log(document.getElementById("quit-app").name);
    ipc.send('shutdown');
})

var electron = require('electron');

// document.getElementById("vault-test").addEventListener('click', () => {
//     ipc.send('getPath', 'ping')
// })

ipc.on('getPathReply', (event, arg) => {
    document.getElementById('message').innerHTML = arg
    console.log(arg);
})


});
