const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  profile_image: { type: Buffer },  // Per salvare l'immagine come BLOB
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
