const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  profile_image: { type: Buffer },  // Per salvare l'immagine come BLOB
  created_at: { type: Date, default: Date.now },
  latest_login: { type: Date, default: Date.now },
  n_download_total: { type: Number, default: 0 },  // Numero di download disponibili all'utente
});

module.exports = mongoose.model('User', UserSchema);
