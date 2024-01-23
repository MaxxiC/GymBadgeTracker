// databaseModel.js
const mongoose = require('mongoose');

const valoreSchema = new mongoose.Schema({
  chiave: String,
  valore: String
});

const Valore = mongoose.model('Valore', valoreSchema);

module.exports = Valore;
