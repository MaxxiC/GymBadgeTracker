// index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
//const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const rateLimit = require('express-rate-limit');
const connectDB = require('./db');  // Assumendo che il file di connessione si chiami db.js

const UserModel = require('./db_model/userModel');
const FileInModel = require('./db_model/fileInModel');
const FileOutModel = require('./db_model/fileOutModel');
const FileStatisticsModel = require('./db_model/file_statisticsModel');
const ActionsLogModel = require('./db_model/actions_logModel');

// Connetti a MongoDB prima di avviare il server
connectDB();



const app = express();
const PORT = process.env.PORT || 3001; // Usa la porta fornita da Heroku o 3001 in locale

app.use(cors({
  exposedHeaders: ['Content-Disposition'],
}));
app.use(bodyParser.json()); // Per gestire il body delle richieste in JSON

// Chiave segreta per il JWT
const JWT_SECRET = process.env.JWT_SECRET; // Usa una chiave segreta sicura in produzione!


const testUserRoutes = require('./testuser');  // Percorso del file dove hai definito la route
// Includi la route
app.use('/', testUserRoutes);




// Configura Multer per l'upload in memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




// Middleware per autenticare e recuperare l'ID utente
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token mancante' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token non valido' });

    req.user = user; // Assicura che req.user sia impostato
    req.userId = user.id; // Imposta req.userId per facilità di accesso
    next();
  });
};




// Configura il rate limiter per la rotta di login
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Durata della finestra: 5 minuti (espressa in millisecondi)
  max: 10, // Numero massimo di richieste consentite per IP in questa finestra temporale
  message: "Hai effettuato troppi tentativi di login. Riprova tra 5 minuti.", // Messaggio di errore
  headers: true, // Invia informazioni aggiuntive come `Retry-After` header
});


// Route per il login
app.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('username o password mancanti');
    return res.status(400).send('username e password sono obbligatori');
  }

  try {
    // Cerca l'utente nel database
    const user = await UserModel.findOne({ username: username });

    if (!user) {
      console.log('Utente non trovato');
      return res.status(400).send('username o password non corretti');
    }

    // Confronta la password hashata
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.log('Password non corrispondente');
      return res.status(400).send('username o password non corretti');
    } else {
      console.log('Password tutto ok');
    }

    // Se tutto è corretto, genera il token JWT
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Login riuscito, token generato');

    res.json({ message: 'Login riuscito', token });
  } catch (err) {
    console.error('Errore durante il login:', err);
    res.status(500).send('Errore interno del server');
  }
});






// Endpoint per ottenere il numero di file e i nomi in ordine di creazione
app.get('/files', authenticateToken, async (req, res) => {
  try {
    const files = await FileInModel.find({ user_id: req.user.id })
      .select('file_id file_name created_at n_download')
      .sort({ created_at: -1 });

    res.json({ count: files.length, files });
  } catch (error) {
    console.error('Errore durante la lettura dei file:', error);
    res.status(500).json({ error: 'Errore durante la lettura dei file.' });
  }
});




// Estrai il nome del file e l'estensione separatamente
const addSuffixToFilename = (filename, suffix) => {
  // Trova l'ultima occorrenza del punto per separare nome ed estensione
  const dotIndex = filename.lastIndexOf('.');
  
  if (dotIndex === -1) {
    // Se non c'è un'estensione, aggiungi semplicemente il suffisso
    return `${filename}${suffix}`;
  }

  // Separa il nome base e l'estensione
  const baseName = filename.substring(0, dotIndex);
  const extension = filename.substring(dotIndex);

  // Ritorna il nome modificato
  return `${baseName}${suffix}${extension}`;
};



// Endpoint di upload
app.post('/upload', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    const filePromises = req.files.map(async (file) => {
      const { originalname, buffer } = file;

      // 1. Salva il file originale in FileInModel
      const newFile = new FileInModel({
        user_id: req.userId,
        file_name: originalname,
        file_data: buffer,
      });
      await newFile.save();

      // 2. Processa il file
      const modifiedData = await processFile(buffer);

      const modifiedFileName = addSuffixToFilename(originalname, '_modificato');

      // 3. Salva il file modificato in FileOutModel
      const modifiedFile = new FileOutModel({
        user_id: req.userId,
        file_id: newFile._id,
        file_name: modifiedFileName,
        file_data: modifiedData,
      });
      await modifiedFile.save();

      return modifiedFile;
    });

    const savedFiles = await Promise.all(filePromises);
    res.status(201).json({ message: 'File caricati e processati con successo', files: savedFiles });

  } catch (error) {
    console.error('Errore durante il caricamento e il processamento dei file:', error);
    res.status(500).json({ message: 'Errore durante il caricamento e il processamento dei file.' });
  }
});






app.get('/download/:fileId', authenticateToken, async (req, res) => {
  try {
    // Trova il file modificato in base all'ID e all'utente autenticato
    const file = await FileOutModel.findOne({ file_id: req.params.fileId, user_id: req.user.id });

    if (!file) {
      return res.status(404).json({ message: 'File non trovato o accesso non autorizzato' });
    }

    // Incrementa il contatore dei download
    file.n_download += 1;
    await file.save();

    // Imposta le intestazioni per il download
    res.set({
      'Content-Disposition': `attachment; filename="${file.file_name}"`,
      'Content-Type': 'application/octet-stream',
    });
    
    //res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
    //res.setHeader('Content-Type', 'application/octet-stream');
    
    res.end(file.file_data);    
  } catch (error) {
    console.error('Errore durante il download del file:', error);
    res.status(500).json({ message: 'Errore durante il download del file.' });
  }
});





//
// Funzioni per la modifica dei file Excel
//


// utils/processFile.js
async function processFile(buffer) {
  // Modifica i dati come necessario, trasformando il buffer originale
  const modifiedBuffer = Buffer.from(buffer); // Clona il buffer originale

  // Applica eventuali trasformazioni specifiche
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay per simulare un'elaborazione

  return modifiedBuffer;
}



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
















//
// Routes rnd
//
// Route per la registrazione
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('Tutti i campi sono obbligatori');
  }

  // Controlla se l'utente esiste già
  const userCheckQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(userCheckQuery, [email], async (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      return res.status(400).send('Email già registrata');
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserisci l'utente nel database
    const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    connection.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) throw err;
      res.status(201).send('Utente registrato con successo');
    });
  });
});














// Rotta protetta (esempio)
app.get('/profile', authenticateToken, (req, res) => {
  res.send(`Benvenuto, utente con ID: ${req.user.id}`);
});



app.get('/ciao', (req, res) => {
  res.send('Ciao');
});



app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
