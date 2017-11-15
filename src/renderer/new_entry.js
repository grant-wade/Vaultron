const ipc = require('electron').ipcRenderer;

$('#submit').click(() => {
    var webSite = $('#website').val();
    var userName = $('#username').val();
    var password = $('#password').val();
    var notes = $('#notes').val();

    if (webSite.length == 0 && userName.length == 0 && password.length == 0){
        $('#status').html("Must input a website, username and password.")
    }
    else if (password.length < 5) {
        $('#status').html("Password must be longer than 5 characters");
    } else {
        console.log(webSite + ' ' + userName + ' ' + password);
        ipc.send('newEntry', [webSite, userName, password, notes]);
        window.close();           
    }
});


ipc.on('newEntryFail', () => {
    $('#status').html("Creation Failed!");
});

