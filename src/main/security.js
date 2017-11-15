const crypto = require('crypto');

module.exports = {
    hashPassword,
    hashPasswordAuth,
    verifyPassword,
    generateMasterKey,
    encrypt,
    decrypt,
    hashCode
};

const HV = {
    iterations: 500000,
    hashBytes: 64,
    saltBytes: 32,
    digest: 'sha512'
};

// =================================== //
// Password hashing and authentication //
// =================================== //
/**
 * Hashes a password for storage and later verification of passwords
 * 
 * @param {String} password 
 * @param {function(Error, Object)} callback 
 */
function hashPasswordAuth(password, callback) {
    // generate a salt
    crypto.randomBytes(HV.saltBytes, (err, salt) => {
        if (err) return callback(err);
        
        // double hash new password for storage and verification
        crypto.pbkdf2(password, salt, HV.iterations, HV.hashBytes, HV.digest, (err, fisrtHash) => {
            if (err) return callback(err);
            
            crypto.pbkdf2(fisrtHash, salt, HV.iterations, HV.hashBytes, HV.digest, (err, secondHash) => {
                if (err) return callback(err);
                
                // create password object
                passObj = {
                    'hash' : secondHash.toString('base64'),
                    'salt' : salt.toString('base64'),
                    'iter' : HV.iterations
                };
                callback(null, passObj);
            });
        });
    });
}


/**
 * Verifies that the password matches the hash
 *
 * @param {String} password
 * @param {Object} combined
 * @param {function(Error, Boolean)} callback
 */
function verifyPassword(password, passObj, callback) {
    // get hashed password and information for passObj
    let hash = Buffer.from(passObj.hash, 'base64');
    let salt = Buffer.from(passObj.salt, 'base64');
    let iter = passObj.iter;
    
    // Double hash the password with passObj's settings
    crypto.pbkdf2(password, salt, iter, hash.length, HV.digest, (err, firstHash) => {
        if (err) return callback(err);
        
        crypto.pbkdf2(firstHash, salt, iter, hash.length, HV.digest, (err, secondHash) => {
            if (err) return callback(err);
            
            callback(null, secondHash.toString('binary') === hash.toString('binary'));
        });
    });
}


/**
 * Hashes a password a single time for encryption/decryption use
 * 
 * @param {String} password
 * @param {Object} passObj
 * @param {function(Error, Buffer)} callback
 */
function hashPassword(password, passObj, callback) {
    let len = Buffer.from(passObj.hash, 'base64').length;
    let salt = Buffer.from(passObj.salt, 'base64');
    let iter = passObj.iter;
    crypto.pbkdf2(password, salt, iter, len, 'sha512', (err, hash) => {
        if (err) return callback(err);
        callback(null, hash);
    });
}


// =================================== //
// Encryption and decyption of entires //
// =================================== //
/**
 * Encrypt data with the passed key
 * 
 * @param {Object} data 
 * @param {Buffer} key 
 * @param {function(Error, Object)} callback 
 */
function encrypt(data, key, callback) {
    getBytes(16, (err, iv) => {
        if (err) return callback(err);
        
        // get a key from the decrypted masterKey
        key = genHmac([key], key);

        // encrypt data with passed key using a random iv
        var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        var payload = cipher.update(JSON.stringify(data), 'utf8', 'base64');
        payload += cipher.final('base64');

        // INTEGRITY CONTROL
        // generate hmac from pl, iv, and key
        var hmac = genHmac([payload, iv, key], key).toString('base64');
        // END INTEGRITY CONTROL
        
        // store info for decrypting
        dataObj = {
            'data' : payload,
            'hmac' : hmac,
            'iv' : iv.toString('base64')
        };
        callback(null, dataObj);
    });
}


/**
 * Decrypt a data object with the passed key
 * 
 * @param {Object} dataObj 
 * @param {Buffer} key 
 * @param {function(Error, String)} callback 
 */
function decrypt(dataObj, key, callback) {
    // get a key from the decrypted masterKey
    key = genHmac([key], key);

    // get encrypted data and information
    var data = Buffer.from(dataObj.data, 'base64');
    var iv = Buffer.from(dataObj.iv, 'base64');
    var hmacOrig = dataObj.hmac;

    // INTEGRITY CONTROL
    // compute hmac
    var hmacNew = genHmac([data, iv, key], key).toString('base64');

    // if hmac's don't match exit
    if (hmacOrig.toString('binary') != hmacNew.toString('binary')) {
        return callback({ error: true, message: "Bad HMAC" });
    }
    // END INTEGRITY CONTROL

    // decipher with passed key
    var output;
    try {
        var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        output = decipher.update(data);
        output += decipher.final();
    } catch(err) {
        return callback({ error: true, message: "Decipher: " + err.message });
    }

    // parse payload back to javascript object
    try {
        output = JSON.parse(output);
    } catch(err) {
        console.log(err);
        return callback({ error: true, message: "JSON error: " + err.message }, output);
    }
    return callback(null, output);
}


// ============== //
// HMAC generator //
// ============== //
/**
 * Generate a 32 byte HMAC of a dataset
 * 
 * @param {Array} data 
 * @param {Buffer} key 
 */
function genHmac(data, key) {
    cipher = crypto.createHmac('sha256', key);
    data.forEach((element) => {
        cipher.update(Buffer.from(element, 'base64'));
    });
    return cipher.digest();
}


// ======================== //
// Key Generation functions //
// ======================== //
/**
 * Generates a master key of 2048 bytes
 *
 * @param {function(Error, Buffer)} callback
 */
function generateMasterKey(callback) {
    getBytes(2048, (err, key) => {
        if (err) {
            return callback(err)
        }
        callback(null, key)
    })
}


/**
 * Generates random bytes of bytes length
 *
 * @param {Number} bytes
 * @param {function(Error, Buffer)} callback
 */
function getBytes(amount, callback) {
    crypto.randomBytes(parseInt(amount), (err, key) => {
        if (err) {
            return callback(err)
        }
        callback(null, key)
    })
}


/**
 * Generates a hash from a string
 * 
 * @param {String} str 
 */
function hashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}