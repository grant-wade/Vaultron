// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



document.getElementById("quit-app").addEventListener("click", function(e) {
    var ipc = require('electron').ipcRenderer;
    console.log(document.getElementById("quit-app").name);
    ipc.send('shutdown');
});
    


