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

$('#auth').click(() => {
    var profName = $('#profileSelect').val();
    var password = $('#password').val();
    ipc.send("checkPassword", [profName, password]);
});

ipc.on('badPassword', (event, arg) => {
    $('#message').html("Incorrect Password")
})
