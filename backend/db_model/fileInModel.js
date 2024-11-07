const mongoose = require('mongoose');

const FileInSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Collegamento all'utente
  file_name: { type: String, required: true },
  file_data: { type: Buffer, required: true },  // Salvare il file come BLOB
  sheet_used_name: { type: String, default: "" },
  rows_processed: { type: Number, default: 0 },  // Numero di righe elaborate
  people_processed: { type: Number, default: 0 },  // Numero di utenti della palestra singoli trovati nel file
  created_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
  deleted_date: { type: Date, default: null }
});

module.exports = mongoose.model('FileIn', FileInSchema);
