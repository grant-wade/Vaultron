const fs = require('fs');

module.exports = {getProfiles, profileExist, createProfile};


/**
 * Verifies that the password matches the hash
 *
 * @param {!String} userData
 * @param {!function(?Error, ?Array)} callback
 */
function getProfiles(userData, callback) {
    var location = userData + '/profiles';
    fs.stat(location, (err, stats) => {
        if (err && err.errno === 34) {
            return callback(err);
        }
    });
    // console.log(location);
    // console.log("test");
    fs.readdir(location, function(err, items) {
        if (typeof items === 'undefined') {
            callback(null, items);
        }
        callback(null, items)
    });
}

/**
 * Checks if a profile with name exists
 *
 * @param {!String} userData
 * @param {!String} name
 * @param {!function(?Boolean)} callback
 */
function profileExist(userData, name, callback) {
    var location = userData + '/profiles/' + name + '/' + name + '.json';
    fs.exists(location, (doesExist) => {
        callback(doesExist);
    });
}


/**
 * Creates a profile with name in userData/profile folder
 *
 * @param {!String} userData
 * @param {!String} name
 * @param {!String} hashedPassword
 * @param {!Buffer} masterKey
 * @param {!function(?Boolean)} callback
 */
function createProfile(userData, name, hashedPassword, masterKey, callback) {
    var location = userData + '/profiles';
    if (!fs.existsSync(location)) { // Creates profile dir
        fs.mkdirSync(location);    // if it doesn't exist
    }
    location += '/' + name; 
    if (!fs.existsSync(location)) { // Creates name dir
        fs.mkdirSync(location);    // if it doesn't exist
    } else { // Profile exists exit
        callback(false);
    }
    var profile = {
        table: [
            {
                "profileName": name,
                "vaultFile": name+"-vault.json",
                "password": hashedPassword,
                "masterKey": masterKey
            }
        ]
    };
    
    location += '/' + name + '.json'
    var json = JSON.stringify(profile);
    fs.writeFile(location, json, 'utf8', callback);
    callback(true);
}