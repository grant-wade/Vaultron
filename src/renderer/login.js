// Script that takes care of the login windows functions



// var electron = require('electron')
const ipc = require('electron').ipcRenderer;

ipc.send('getProfiles');

ipc.on('getProfilesReply', (event, arg) => {
    var html = "";
    for (var i = 0; i < arg.length; i++) {
        html += "<option value=" + arg[i] + ">" + arg[i] + "</option>";
    }
    document.getElementById('profileSelect').innerHTML = html;
})