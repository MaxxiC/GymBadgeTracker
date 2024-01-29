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
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

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
    console.log('-0 Ricevuti ' + req.files.length + ' Files con successo!');

    // Esegui le operazioni di modifica sul file appena ricevuto
    const modifiedFilePaths = [];
    for (const file of req.files) {
      try {
        const modifiedFilePath = await modifyFile(file.path);
        modifiedFilePaths.push(modifiedFilePath);
      } catch (error) {
        console.error(`-0 Errore durante la modifica del file ${file.originalname}:`, error);
        // Ignora l'errore e continua con gli altri file
      }
    }

    // Invia una risposta con i percorsi dei file modificati
    res.status(200).json({ message: 'Files ricevuti e modificati con successo!', modifiedFiles: modifiedFilePaths });
  } catch (error) {
    console.error('-0 Errore durante il salvataggio dei file:', error);
    res.status(500).json({ error: 'Errore durante il salvataggio dei file.' });
  }
});



// Utilizzo della funzione modifyFile
async function modifyFile(inputFilePath) {
  try {
    // Carica il file Excel con exceljs
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFilePath);

    // Chiamiamo la funzione per copiare, ridimensionare e applicare filtri
    const filters = ['--', 'STAFF', 'altro_valore_da_escludere']; // Aggiungi i filtri necessari
    await copyResizeAndApplyFilters(workbook, filters);

    // Chiamiamo la funzione per il controllo degli ID duplicati
    await checkDuplicateIDs(workbook);

    // Salva il file modificato
    const outputFilePath = inputFilePath.replace('.xlsx', '-modificato.xlsx');
    await workbook.xlsx.writeFile(outputFilePath);
    console.log(`-x File modificato con successo. Risultato salvato in: ${outputFilePath}`);

  } catch (error) {
    console.error('-x Errore durante la modifica del file Excel:', error);
    // Lanciamo un'eccezione per gestire l'errore nella chiamata dell'API
    throw error;
  }
}



// Funzione per copiare il foglio, ridimensionare le colonne e applicare filtri
async function copyResizeAndApplyFilters(workbook, filters) {
  try {
    // Ottieni il primo foglio di lavoro
    const sourceWorksheet = workbook.getWorksheet(1);

    // Crea un nuovo foglio di lavoro
    const targetWorksheet = workbook.addWorksheet('CopiaFoglio');

    // Copia i dati dalla sorgente al target e applica i filtri
    let targetRowNumber = 1; // Indice delle righe nel foglio di destinazione

    sourceWorksheet.eachRow((row, rowNumber) => {
      const filterValue = row.getCell(6).value;

      // Controlla se la stringa contiene almeno uno dei filtri
      const filterMatch = filters.some(filter => filterValue && filterValue.includes(filter));

      // Se la riga non soddisfa i filtri, passa alla prossima iterazione
      if (rowNumber !== 1 && (!filterValue || filterMatch)) {
        return;
      }

      // Copia l'intestazione senza filtri
      if (rowNumber === 1) {
        row.eachCell((cell, colNumber) => {
          targetWorksheet.getCell(targetRowNumber, colNumber).value = cell.value;
        });
        targetRowNumber++;
      } else {
        // Copia i dati dalla sorgente al target
        row.eachCell((cell, colNumber) => {
          targetWorksheet.getCell(targetRowNumber, colNumber).value = cell.value;
        });
        targetRowNumber++;
      }
    });

    // Ridimensiona automaticamente le colonne nel nuovo foglio
    targetWorksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const textLength = cell.value ? cell.value.toString().length : 0;
        maxLength = Math.max(maxLength, textLength);
      });
      column.width = maxLength + 2; // Aggiunge un po' di spazio
    });

    console.log('-1 Foglio copiato, colonne ridimensionate e filtri applicati.');

  } catch (error) {
    console.error('-1 Errore durante la copia, ridimensionamento e applicazione dei filtri del foglio Excel:', error);
    // Lanciamo un'eccezione per gestire l'errore nella chiamata dell'API
    throw error;
  }
}


// Funzione per il controllo degli ID duplicati e copia delle righe sottolineate di rosso
async function checkDuplicateIDs(workbook) {
  try {
    // Ottieni il foglio di lavoro
    const worksheet = workbook.getWorksheet('CopiaFoglio');

    // Creiamo un oggetto per tracciare gli ID e le relative occorrenze
    const idOccurrences = {};

    // Creiamo un nuovo foglio di lavoro per le righe sottolineate di rosso
    const redRowsWorksheet = workbook.addWorksheet('RigheSottolineateRosse');

    // Aggiungi l'intestazione delle colonne al nuovo foglio
    const headerRow = redRowsWorksheet.addRow(worksheet.getRow(1).values);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }; // Rende il testo in grassetto
    });

    

    // Scansiona ogni riga del foglio
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Controllo degli ID duplicati
        const currentID = row.getCell(1).value;
        
        if (!idOccurrences[currentID]) {
          // Prima occorrenza dell'ID, registrala
          idOccurrences[currentID] = [row];
        } else {
          // ID duplicato, aggiungi la riga alle occorrenze
          idOccurrences[currentID].push(row);
        }
      }
    });

    // Colora di rosso chiaro tutte le occorrenze degli ID duplicati
    Object.values(idOccurrences).forEach(occurrences => {
      if (occurrences.length > 1) {
        occurrences.forEach(row => {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF9999' }, // Rosso chiaro
            };
          });

          // Copia la riga sottolineata di rosso nel nuovo foglio
          const newRow = redRowsWorksheet.addRow(row.values);
          // Copia anche lo stile dalla riga originale
          newRow.eachCell((cell, colNumber) => {
            const originalCell = row.getCell(colNumber);
            cell.style = originalCell.style;
          });
        });
      }
    });

    // Ridimensiona automaticamente le colonne nel nuovo foglio
    redRowsWorksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const textLength = cell.value ? cell.value.toString().length : 0;
        maxLength = Math.max(maxLength, textLength);
      });
      column.width = maxLength + 2; // Aggiunge un po' di spazio
    });

    console.log('-2 Controllo degli ID duplicati e copia delle righe sottolineate di rosso completati.');

  } catch (error) {
    console.error('-2 Errore durante il controllo degli ID duplicati e la copia delle righe sottolineate di rosso:', error);
    // Lanciamo un'eccezione per gestire l'errore nella chiamata dell'API
    throw error;
  }
}







// Endpoint per ottenere il numero di file e i nomi in ordine di creazione
app.get('/files', (req, res) => {
  try {
    const files = getFilesInUploadsFolder();
    res.json({ count: files.length, files });
  } catch (error) {
    console.error('Errore durante la lettura dei file:', error);
    res.status(500).json({ error: 'Errore durante la lettura dei file.' });
  }
});

// Funzione per ottenere tutti i file nelle cartelle "uploads" in modo ricorsivo
function getFilesInUploadsFolder() {
  const folderPath = path.join(__dirname, uploadFolder);
  const filesInfo = [];

  // Funzione ricorsiva per ottenere i file nelle sottocartelle
  function readFilesRecursively(currentPath) {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        // Se è una cartella, continua la ricerca ricorsiva
        readFilesRecursively(filePath);
      } else {
        // Se è un file e non contiene "-modificato" nel nome, aggiungi le informazioni all'array
        if (!file.includes('-modificato')) {
          //cartella/nomefile
          const relativePath = path.relative(folderPath, filePath);
          //scritto per l'url
          const encodedFileName = encodeURIComponent(relativePath).replace(/%20/g, ' '); // Codifica e sostituzione spazi
          const downloadUrl = `/download/${encodedFileName}`; // URL di download con il percorso della cartella
          const downloadUrlModificato = downloadUrl.replace('.', '-modificato.'); // Aggiunge "-modificato" prima dell'estensione
          filesInfo.push({
            id: filesInfo.length + 1,
            name: file,
            creationDate: stats.birthtime,
            downloadUrl,
            downloadUrlModificato,
          });
        }
      }
    });
  }

  // Avvia la ricerca ricorsiva dalla cartella principale
  readFilesRecursively(folderPath);

  // Ordina i file per data di creazione (in ordine decrescente)
  filesInfo.sort((a, b) => b.creationDate - a.creationDate);

  return filesInfo;
}





// Endpoint per il download di un file
app.get('/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, uploadFolder, fileName);

  // Verifica che il file esista
  if (fs.existsSync(filePath)) {
    // Invia il file come risposta
    res.download(filePath, decodeURI(fileName));
  } else {
    // Se il file non esiste, restituisci una risposta 404
    res.status(404).send('File non trovato.');
  }
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
