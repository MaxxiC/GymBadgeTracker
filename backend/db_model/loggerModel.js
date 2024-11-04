const mongoose = require('mongoose');

const LoggerSchema = new mongoose.Schema({
  user_username: { type: String, ref: 'User', required: true },  // Collegamento all'utente
  
  log_type: { 
    type: String, 
    enum: ['upload', 'download', 'delete', 'login', 'error', 'other'], 
    required: true 
  },
  log_message: { type: String, required: true },  // Salvare il file come BLOB
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Logger', LoggerSchema);
