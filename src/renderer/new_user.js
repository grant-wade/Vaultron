
$(function () {
    
// var electron = require('electron')
const ipc = require('electron').ipcRenderer;

$('#submit').click( () => {
    var profName = $('#profileName').val();
    var password = $('#password').val();
    if (password.length < 5) {
        $('#status').html("Password must be longer than 5 characters");
    } else {
        console.log(profName + ' ' + password);
        ipc.send('newProfile', [profName, password]);
    }
    
})

ipc.on('profileCreateFail', (err) => {
    $('#status').val = err;
})

});