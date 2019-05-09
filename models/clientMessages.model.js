const mongoose = require('mongoose');
const MessageSchema = mongoose.Schema({
  SenderName: { type: String, required: true },
  SenderID: { type: String, required: true },
  ReciverName: { type: String, required: true },
  ReciverID: { type: String, required: true },
  Message: { type: String, required: true },
  isViewed: { type: Boolean, default: false },
  Projectid: { type: String, required: true }
}, { timestamps: true, createIndexes: true });
module.exports = mongoose.model('ClientMessages', MessageSchema);