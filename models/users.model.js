const mongoose = require('mongoose');
const UserDetailsSchema = mongoose.Schema({
    Firstname: {
        type: String,
        required: true
    },
    Lastname: {
        type: String,
        required: true
    },
    Uid: {
        type: String,
        required: true,
        unique: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        default: 'Y'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    Projectid: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    createIndexes: true
});  
module.exports = mongoose.model('TempClientDetails', UserDetailsSchema);