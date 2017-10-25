/** ==================================================== //
// Script that takes care of the login windows functions //
// ===================================================== */


// ====================== //
// Import needed packages //
// ====================== //
const ipc = require('electron').ipcRenderer;

// ================================= //
// Tell main process to get profiles //
// ================================= //
ipc.send('getProfiles');

// ===================== //
// Get returned profiles //
// ===================== //
ipc.on('getProfilesReply', (event, arg) => {
    var html = "";
    for (var i = 0; i < arg.length; i++) {
        html += "<option value=" + arg[i] + ">" + arg[i] + "</option>";
    }
    $('#profileSelect').html(html);
})

// ===================================== //
// Authenticate user when button pressed //
// ===================================== //
$('#auth').click(() => {
    var profName = $('#profileSelect').val();
    var password = $('#password').val();
    ipc.send("checkPassword", [profName, password]);
});

// ============================================= //
// Return message if the password is not correct //
// ============================================= //
ipc.on('badPassword', (event, arg) => {
    $('#message').html("Incorrect Password")
})
