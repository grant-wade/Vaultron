
// var electron = require('electron')
const ipc = require('electron').ipcRenderer;

$('#submit').click(() => {
    var profName = $('#profileName').val();
    var password = $('#password').val();
    if (profName.length < 1) {
        $('#status').html("Username must be at least 1 character");
    } else if (password.length < 5) {
        $('#status').html("Password must be longer than 5 characters");
    } else {
        console.log(profName + ' ' + password);
        ipc.send('newProfile', [profName, password]);
    }

})

ipc.on('profileCreateFail', (event, error) => {
    $('#status').html("Profile creation failed!" + error);
})