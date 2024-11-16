const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  profile_image: { type: Buffer },                // Per salvare l'immagine come BLOB
  created_at: { type: Date, default: Date.now },  //Data creazione effettuata dall'admin
  first_login: { type: Date, default: null },     //Data primo login dell'utente
  latest_login: { type: Date, default: null },    //Data ultimo login dell'utente
  total_login: { type: Number, default: 0 },      //Totale dei login effettuati
  n_usage_total: { type: Number, default: 0 },    // Numero di download disponibili all'utente
  user_type: {type: String }
});

module.exports = mongoose.model('User', UserSchema);
