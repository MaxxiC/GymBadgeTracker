const mongoose = require('mongoose');

const FileInSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Collegamento all'utente
  file_name: { type: String, required: true },
  file_data: { type: Buffer, required: true },  // Salvare il file come BLOB
  sheet_used_name: { type: String, default: "" },
  rows_processed: { type: Number, default: 0 },  // Numero di righe elaborate
  tot_row_processed: { type: Number, default: 0 },  // Numero di utenti della palestra singoli trovati nel file
  people_processed: { type: String, default: null },  // ID degli utenti della palestra singoli trovati nel file
  total_people_processed: { type: Number, default: 0 },  // total ID degli utenti della palestra singoli trovati nel file
  created_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
  deleted_date: { type: Date, default: null },
  filters_used: {type: String, default: null},
});

module.exports = mongoose.model('FileIn', FileInSchema);
