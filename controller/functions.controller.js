var passwordHash = require('password-hash');
// Password hash creation
exports.PasswordHashCreate = async function (psw, callback) {
    callback(await passwordHash.generate(psw));
};
// Password Verify function
exports.PasswordCheck = async function (psw, hash, callback) {
    callback(await passwordHash.verify(psw, hash));
};
