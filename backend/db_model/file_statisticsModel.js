const mongoose = require('mongoose');

const FileStatisticsSchema = new mongoose.Schema({
  file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  total_rows: { type: Number, required: true },  // Numero di righe totali nel file Excel
  processed_rows: { type: Number, required: true },  // Numero di righe elaborate
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileStatistics', FileStatisticsSchema);
