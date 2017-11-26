// =============== //
// Testing imports //
// =============== //
let security = require('../main/security.js');

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


$(() => {
    let encKey;
    security.generateMasterKey((err, key) => {encKey = key});

    $('#textInput').bind('input propertychange', () => {
        var input = $('#textInput').val();
        security.encrypt(input, encKey, (err, encStr) => {
            $('#encInput').html(encStr.data);
            security.decrypt(encStr, encKey, (err, decStr) => {
                $('#decInput').html(escapeHtml(decStr));
            });
        });
    });

    let passObj;
    $('#savePassOne').on('click', function() {
        var pass = $('#passInputOne').val();
        security.hashPasswordAuth(pass, (err, passHash) => {
            passObj = passHash;
            $('#passwordHash').html(passObj.hash);
            $('#passResult').html('');
        });
    });

    $('#savePassTwo').on('click', function() {
        var pass = $('#passInputTwo').val();
        security.verifyPassword(pass, passObj, (err, result) => {
            if (result) {
                $('#passResult').html('Passwords Match!');
            } else {
                $('#passResult').html("Passwords don't match!");
            }
        });
    });
});