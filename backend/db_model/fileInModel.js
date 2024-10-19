const mongoose = require('mongoose');

const FileInSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Collegamento all'utente
  file_name: { type: String, required: true },
  file_data: { type: Buffer, required: true },  // Salvare il file come BLOB
  rows_processed: { type: Number, default: 0 },  // Numero di righe elaborate
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileIn', FileInSchema);
