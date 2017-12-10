const fs = require('fs');
const security = require('./security.js');


// Export functions for external use
module.exports = {
    getProfiles,
    profileExist,
    createProfile,
    getProfile,
    addEntry
};


/**
 * Get all profiles in the users directory
 *
 * @param {String} userData
 * @param {function(Error, Array)} callback
 */
function getProfiles(userData, callback) {
    var location = userData + '/profiles';

    // Check if the profiles dir exists
    if (!fs.existsSync(location)) {
        return callback(null)
    }

    // Read the contents of profiles directory
    fs.readdir(location, function (err, items) {
        var profiles = [];
        if (typeof items === 'undefined') {
            callback(null, items);
        }
        if (!items.length > 0) {
            return callback(null, []);
        }
        items.forEach((element) => {
            try {
                var profile = JSON.parse(fs.readFileSync(location + '/' + element, 'utf8'));
                if (typeof profile.details.name != 'undefiend') {
                    profiles.push(profile.details.name);
                }
            } catch(e) {
                return;
            }
        });
        callback(null, profiles);
    });
}


/**
 * Checks if a profile with name exists
 *
 * @param {String} userData
 * @param {String} name
 * @param {function(Error, Boolean)} callback
 */
function profileExist(userData, name, callback) {
    var location = userData + '/profiles/' + name + '.json';
    fs.exists(location, (doesExist) => {
        callback(null, doesExist);
    });
}


/**
 * Checks if a profile with name exists
 *
 * @param {String} userData
 * @param {String} name
 * @param {function(Error, Object)} callback
 */
function getProfile(userData, name, callback) {
    var file = userData + '/profiles/' + name + '.json';
    profileExist(userData, name, (err, exists) => {
        if (exists) {
            var profile = JSON.parse(fs.readFileSync(file, 'utf8'));
            callback(null, profile);
        }
    });
}


/**
 * Creates a profile with name in userData/profile folder
 *
 * @param {String} userData
 * @param {String} name
 * @param {Object} passObj
 * @param {Buffer} masterKey
 * @param {function(Error, Boolean)} callback
 */
function createProfile(userData, name, passObj, masterKey, callback) {
    var location = userData + '/profiles';
    if (!fs.existsSync(location)) { // Creates profile dir
        fs.mkdirSync(location); // if it doesn't exist
    }
    var profile = {
        details: {
            "name": name,
            'count' : 0,
            "password": passObj,
            "masterKey": masterKey
        },
        vault: {
        }
    };
    location += '/' + name + '.json'
    var json = JSON.stringify(profile, null, 2);
    fs.writeFile(location, json, 'utf8', callback);
    callback(null, true);
}


/**
 * Add an entry to the users profile.json file
 * Entries names are NOT unique
 *
 * @param {String} userData
 * @param {String} name
 * @param {Buffer} hashedPassword
 * @param {Buffer} masterKey
 * @param {function(Error, Boolean)} callback
 */
function addEntry(userData, profile, entry, callback) {
    var prof_id = profile.details.count;
    profile.details.count += 1;
    profile.vault[prof_id] = entry;
    var location = userData + '/profiles/' + profile.details.name + '.json'
    var json = JSON.stringify(profile, null, 2);
    fs.writeFile(location, json, 'utf8', (err) => {if (err) return callback(err)})
    callback(null, true);
}