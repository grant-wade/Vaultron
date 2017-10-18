// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const app = electron.app;

$(function () {

var electron = require('electron')
const ipc = electron.ipcRenderer;

document.getElementById("quit-app").addEventListener("click", function(e) {
    var ipc = require('electron').ipcRenderer;
    console.log(document.getElementById("quit-app").name);
    ipc.send('shutdown');
});

var electron = require('electron');

document.getElementById("vault-test").addEventListener('click', function () {
    ipc.send('getPath', 'ping')
})

ipc.on('getPathReply', function (event, arg) {
    document.getElementById('message').innerHTML = arg
    console.log(arg);
})

});