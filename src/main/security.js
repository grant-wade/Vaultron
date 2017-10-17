const crypto = require('crypto');

const hashVars = {
    iterations: 500000,
    hashBytes: 64,
    saltBytes: 32,
    digest: 'sha512'
};

/**
 * Hashes given password using PBKDF2 with a random
 * salt and a derived key size of 512 bits.
 *
 * @param {!String} password
 * @param {!function(?Error, ?Buffer=)} callback
 */
function hashPassword(password, callback) {
    crypto.randomBytes(hashVars.saltBytes, (err, salt) => {
        if (err) {
            return callback(err);
        }
        crypto.pbkdf2(password, salt, hashVars.iterations, hashVars.hashBytes, hashVars.digest, (err, hash) => {
            if (err) {
                return callback(err);
            }
            const combined = Buffer.alloc(hash.length + salt.length + 8);

            // Figure out how much of the hash is salt
            combined.writeUInt32BE(salt.length, 0, true);
            // Similarly, include the iteration count
            combined.writeUInt32BE(hashVars.iterations, 4, true);

            // Include salt before hash
            salt.copy(combined, 8);
            hash.copy(combined, salt.length + 8);
            // Return combined hash
            callback(null, combined);
        });
    });
}

/**
 * Verifies that the password matches the hash
 *
 * @param {!String} password
 * @param {!Buffer} combined
 * @param {!function(?Error, ?Buffer=)} callback
 */
function verifyPassword(password, combined, callback) {
    const buffer = Buffer.from(combined, 'hex');

    // Extract the salt and hash from the combined buffer
    const saltBytes = buffer.readUInt32BE(0);
    const hashBytes = buffer.length - saltBytes - 8;
    const iterations = buffer.readUInt32BE(4);
    const salt = buffer.slice(8, saltBytes + 8);
    const hash = buffer.toString('binary', saltBytes + 8);

    // Verify the salt and hash against the password
    crypto.pbkdf2(password, salt, iterations, hashBytes, hashVars.digest, (err, verify) => {
        if (err) {
            return callback(err, false);
        }
        callback(null, verify.toString('binary') === hash);
    });
}
