// index.js
const express = require('express');
const mongoose = require('mongoose');
const Valore = require('./db_model/databaseModel'); // Imposta il percorso corretto

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/il_tuo_database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Errore nella connessione al database:'));
db.once('open', () => {
  console.log('Connesso al database MongoDB');
});

app.get('/ciao', (req, res) => {
  res.send('Ciao');
});

app.get('/on', async (req, res) => {
  try {
    const risultato = await Valore.findOne({ chiave: 'nome' });

    if (risultato) {
      res.send(`Il valore per la chiave 'nome' è: ${risultato.valore}`);
    } else {
      res.send('Valore non trovato nel database.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Errore nella ricerca nel database.');
  }
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
