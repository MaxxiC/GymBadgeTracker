const mongoose = require('mongoose');

const ActionsLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action_type: { 
    type: String, 
    enum: ['upload', 'download', 'login'], 
    required: true 
  },
  file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },  // Collegato a un file (può essere null)
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActionsLog', ActionsLogSchema);
