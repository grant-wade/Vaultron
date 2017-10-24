const fs = require('fs');

module.exports = {
    getProfiles,
    profileExist,
    createProfile,
    getProfile
};


/**
 * Verifies that the password matches the hash
 *
 * @param {!String} userData
 * @param {!function(?Error, ?Array)} callback
 */
function getProfiles(userData, callback) {
    var location = userData + '/profiles';

    // Make sure profiles folder exists
    fs.stat(location, (err, stats) => {
        if (err && err.errno === 34) {
            return callback(err);
        }
    });

    // Read the contents of profiles directory
    fs.readdir(location, function (err, items) {
        var profiles = [];
        if (typeof items === 'undefined') {
            callback(null, items);
        }
        items.forEach(function(element) {
            var profile = JSON.parse(fs.readFileSync(location + '/' + element, 'utf8'));
            if (typeof profile.details.profileName != 'undefiend') {
                profiles.push(profile.details.profileName);
            }
        });
        callback(null, profiles);
    });
}

/**
 * Checks if a profile with name exists
 *
 * @param {!String} userData
 * @param {!String} name
 * @param {!function(?Error, ?Boolean)} callback
 */
function profileExist(userData, name, callback) {
    var location = userData + '/profiles/' + name + '.json';
    fs.exists(location, (doesExist) => {
        callback(doesExist);
    });
}


/**
 * Checks if a profile with name exists
 *
 * @param {!String} userData
 * @param {!String} name
 * @param {!function(?Error, ?Object)} callback
 */
function getProfile(userData, name, callback) {
    var file = userData + '/profiles/' + name + '/' + name + '.json';
    profileExist(userData, name, (err, exists) => {
        if (exists) {
            var profile = JSON.parse(fs.readFileSync(file, 'utf8'));
            
            callback(null, );
        }
    });
}


/**
 * Creates a profile with name in userData/profile folder
 *
 * @param {!String} userData
 * @param {!String} name
 * @param {!Buffer} hashedPassword
 * @param {!Buffer} masterKey
 * @param {!function(?Boolean)} callback
 */
function createProfile(userData, name, hashedPassword, masterKey, callback) {
    var location = userData + '/profiles';
    if (!fs.existsSync(location)) { // Creates profile dir
        fs.mkdirSync(location); // if it doesn't exist
    }
    var profile = {
        details: {
            "profileName": name,
            "vaultFile": name + "-vault.json",
            "password": hashedPassword.toString('base64'),
            "masterKey": masterKey.toString('base64')
        },
        vault: {

        }
    };
    location += '/' + name + '.json'
    var json = JSON.stringify(profile);
    fs.writeFile(location, json, 'utf8', callback);
    callback(true);
}