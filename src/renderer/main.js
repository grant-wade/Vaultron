/** ================================================= //
// JavaScript file that deals with main.html function //
// ================================================== */

// ====================== //
// Import needed packages //
// ====================== //
const ipc = require('electron').ipcRenderer;

// ===================================== //
// On quit button click send quit signal //
// ===================================== //
$('#quit-app').click(() => {
    ipc.send('shutdown');
});


// ========================================= //
// Escapes websites, usernames and passwords //
// ========================================= //
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function unescapeHtml(escapedStr) {
    var div = document.createElement('div');
    div.innerHTML = escapedStr;
    var child = div.childNodes[0];
    return child ? child.nodeValue : '';
}


// =========================== //
// DataTable setup and display //
// =========================== //

let table

function dataTableUpdate() {
    ipc.send('getProfile');  
}

ipc.on('returnProfile', function(event, profile) {
    var dataSet = [];
    for (var key in profile.vault) {
        dataSet.push([escapeHtml(profile.vault[key].website),
                      escapeHtml(profile.vault[key].username),
                      escapeHtml(profile.vault[key].password)]);
    } 
    table = $('#passwords').DataTable( {
        data: dataSet,
        "scrollY":        "700px",
        "scrollCollapse": true,
        "paging":         false,
        
        columns: [
            { title: "Website" },
            { title: "Username" },
            { title: "Password", "visible":false },
        ]
        
    });
    $('#myCheck1').change(function() {
        dt.columns(2).visible(!$(this).is(':checked'))
      });
});

$('#passwords').on( 'click', 'td', function () {
    console.log( table.cell( this ).data() );
} );


// Uses Jquery to allow table to be sorted and scrollable
$(document).ready(function() {
    dataTableUpdate();
});


/* Script for generating cryptographically secure random passwords */
console.log('passwords generator');
$('#pass_gen').click(() => {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;
    let win_size = 1500;
    const win = new BrowserWindow({
        frame: true, // removes chrome frame on all platforms
        resizable: false, // makes sure window cannot be resized
        width: win_size * 0.45,
        height: win_size * 0.5,
    });
    win.loadURL(`file://${__dirname}/../renderer/pass_gen.html`);
});


/* created the new entry window */
$('#new_entry').click(() => {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;
    let win_size = 1500;
    const win = new BrowserWindow({
        frame: true,
        resizable: false,
        width: win_size * 0.45,
        height: win_size * 0.45
    });
    win.loadURL(`file://${__dirname}/../renderer/new_entry.html`);
    win.on('closed', () => {
        win = null
    });
});
