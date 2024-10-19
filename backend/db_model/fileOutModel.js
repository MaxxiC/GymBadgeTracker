const mongoose = require('mongoose');

const FileOutSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Collegamento all'utente
  file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FileIn', required: true },  // Collegamento al file originale
  file_name: { type: String, required: true },
  file_data: { type: Buffer, required: true },  // Salvare il file come BLOB
  n_download: { type: Number, default: 0 },  // Numero di download eseguiti
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileOut', FileOutSchema);
