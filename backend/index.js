// index.js
const express = require('express');
const mongoose = require('mongoose');
const Valore = require('./db_model/databaseModel'); // Imposta il percorso corretto
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
//const xlsx = require('xlsx');
const ExcelJS = require('exceljs');

const app = express();
const port = 3001;

//mongoose
// mongoose.connect('mongodb://localhost:27017/il_tuo_database', { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'Errore nella connessione al database:'));
// db.once('open', () => {
//   console.log('Connesso al database MongoDB');
// });


// Configura multer per gestire l'upload di file nella cartella "uploads"
const uploadFolder = 'uploads/';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Crea la cartella con il nome del giorno corrente
    const currentDateFolder = path.join(uploadFolder, getCurrentDateFolder());
    if (!fs.existsSync(currentDateFolder)) {
      fs.mkdirSync(currentDateFolder, { recursive: true });
    }
    cb(null, currentDateFolder);
  },
  filename: function (req, file, cb) {
    // Costruisci il nome del file
    const originalname = file.originalname;
    const ext = path.extname(originalname);
    const base = path.basename(originalname, ext);

    // Verifica se il file esiste già
    const destination = path.join(uploadFolder, getCurrentDateFolder());
    let newName = originalname;
    let i = 1;

    while (fs.existsSync(path.join(destination, newName))) {
      newName = `${base}-${i}${ext}`;
      i++;
    }

    // Usa il nuovo nome del file
    cb(null, newName);
  },
});

const upload = multer({ storage: storage });

// Funzione per ottenere la stringa della data corrente nel formato "YYYY-MM-DD"
function getCurrentDateFolder() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}






//API $$

app.post('/upload', multer({ storage: storage }).array('files'), async (req, res) => {
  try {
    console.log('Files ricevuti con successo!');

    // Esegui le operazioni di modifica sul file appena ricevuto
    const modifiedFilePaths = [];
    for (const file of req.files) {
      try {
        const modifiedFilePath = await modifyFile(file.path);
        modifiedFilePaths.push(modifiedFilePath);
      } catch (error) {
        console.error(`Errore durante la modifica del file ${file.originalname}:`, error);
        // Ignora l'errore e continua con gli altri file
      }
    }

    // Invia una risposta con i percorsi dei file modificati
    res.status(200).json({ message: 'Files ricevuti e modificati con successo!', modifiedFiles: modifiedFilePaths });
  } catch (error) {
    console.error('Errore durante il salvataggio dei file:', error);
    res.status(500).json({ error: 'Errore durante il salvataggio dei file.' });
  }
});



// Funzione per modificare il file Excel
async function modifyFile(filePath) {
  try {
    // Carica il file Excel con exceljs
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Ottieni il primo foglio di lavoro
    const worksheet = workbook.getWorksheet(1);

    // Applica stile a tutte le celle nella prima riga
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }, // Colore rosso per sfondo
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // Colore bianco per il testo
        };
      });
    });

    // Salva il file modificato
    const resultFilePath = filePath.replace('.xlsx', '-risultato.xlsx');
    await workbook.xlsx.writeFile(resultFilePath);
    console.log(`Risultato salvato in: ${resultFilePath}`);

    // Restituisci il percorso del file modificato
    return resultFilePath;
  } catch (error) {
    console.error('Errore durante la modifica del file Excel:', error);
    // Lanciamo un'eccezione per gestire l'errore nella chiamata dell'API
    throw error;
  }
}










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
