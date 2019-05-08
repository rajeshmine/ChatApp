const mongoose = require('mongoose');
const UserDetailsSchema = mongoose.Schema({}, {
    strict: false
});
module.exports = mongoose.model('TempClientDetails', UserDetailsSchema);