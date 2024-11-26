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
const UAParser = require('ua-parser-js');
const connectDB = require('./db');  // Assumendo che il file di connessione si chiami db.js

const UserModel = require('./db_model/userModel');
const FileInModel = require('./db_model/fileInModel');
const FileOutModel = require('./db_model/fileOutModel');
//const FileStatisticsModel = require('./db_model/file_statisticsModel');
//const ActionsLogModel = require('./db_model/actions_logModel');
const LoggerModel = require('./db_model/loggerModel');

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



const createLogDB = async (userUsername, logType, logMessage) => {
  try {
    // Crea un nuovo documento nel modello Logger
    const newLog = new LoggerModel({
      user_username: userUsername,
      log_type: logType,
      log_message: logMessage, // Converte il messaggio in un Buffer se necessario
      created_at: new Date() // Aggiunto automaticamente, ma puoi specificarlo
    });

    // Salva il log nel database
    await newLog.save();
    console.log('Log creato con successo - ' + userUsername + " - " + logMessage);
  } catch (error) {
    console.error('Errore durante la creazione del log:', error);
  }
};


const parser = new UAParser();

// Configura il rate limiter per la rotta di login
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Durata della finestra: 5 minuti (espressa in millisecondi)
  max: 3, // Numero massimo di richieste consentite per IP in questa finestra temporale
  message: "Hai effettuato troppi tentativi di login. Riprova tra 5 minuti.", // Messaggio di errore
  headers: true, // Invia informazioni aggiuntive come `Retry-After` header
  handler: (req, res, next) => {
    // Log della violazione del limite

    console.log("Entrato");

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = parser.setUA(userAgent).getResult();

    const deviceType = result.device.type || 'desktop';
    const osName = result.os.name || 'OS sconosciuto';
    const browserName = result.browser.name || 'Browser sconosciuto';

    const logMessage = `Superato limite di login da IP ${ipAddress} usando ${deviceType} con OS ${osName} e browser ${browserName}`;
    createLogDB('sistema', 'error', logMessage);

    // Risposta personalizzata
    res.status(429).json({ message: "Hai effettuato troppi tentativi di login. Riprova tra 5 minuti." });
  }
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
    const expiresInS = 60 * 60 * 1000; // 1 ora di validità del token in Secondi
    const expiresInMS = expiresInS * 1000; // Validità del token in MilliSecond
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: expiresInS });
    console.log('Login riuscito, token generato');

    let isAdmin;
    if (user.user_type && user.user_type === "admin") {
      isAdmin = 1;
    } else {
      isAdmin = 0;
    }
    console.log(isAdmin);
    
    if(!user.first_login){
    user.first_login = Date.now();
    }
    
    user.latest_login = Date.now();
    user.total_login++;
    await user.save();

    // Chiama la funzione di creazione log dopo l'operazione
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = parser.setUA(userAgent).getResult();

    const deviceType = result.device.type || 'desktop';
    const osName = result.os.name || 'OS sconosciuto';
    const browserName = result.browser.name || 'Browser sconosciuto';

    console.log(`Dispositivo: ${deviceType}, OS: ${osName}, Browser: ${browserName}`);

    // Puoi includere queste informazioni nel log
    const logMessage = `Login riuscito da IP: ${ipAddress} - ${deviceType} con OS ${osName} e browser ${browserName}`;
    await createLogDB(user.username, 'login', logMessage);

    res.json({ message: 'Login riuscito', token, expiresInMS, isAdmin });
  } catch (err) {
    console.error('Errore durante il login:', err);
    res.status(500).send('Errore interno del server');
  }
});


// Endpoint per ottenere i dati dell'utente autenticato
app.get('/api/user-dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password_hash');
    if (!user) return res.status(404).send({ message: 'User not found' });

    // Calcolo totale download
    const totalDownloads = await FileOutModel.aggregate([
      { $match: { user_id: user._id } },
      { $group: { _id: null, total: { $sum: '$n_download' } } }
    ]);

    // Calcolo totale documenti caricati
    const totalDocuments = await FileInModel.countDocuments({ user_id: user._id });

    res.send({
      username: user.username,
      email: user.email,
      n_usage_total: user.n_usage_total,
      total_downloads: totalDownloads[0]?.total || 0,
      total_documents: totalDocuments,
      first_login: user.first_login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});



// Endpoint per ottenere il numero di file e i nomi in ordine di creazione
app.get('/files', authenticateToken, async (req, res) => {
  try {
    const files = await FileInModel.find({
      user_id: req.user.id
      , deleted: false
    })
      .select('file_id file_name sheet_used_name created_at n_download')
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



// Endpoint di delete
app.post('/delete', authenticateToken, async (req, res) => {
  try {

    // Trova il file in base all'ID e all'utente autenticato
    const file = await FileInModel.findOne({ _id: req.body.fileId_todelete, user_id: req.user.id });

    if (!file) {
      return res.status(404).json({ message: 'File non trovato o accesso non autorizzato' });
    }

    // Incrementa il contatore dei download
    file.deleted = true;
    file.deleted_date = Date.now();
    await file.save();

    // Chiama la funzione di creazione log dopo l'operazione
    await createLogDB(req.user.username, 'delete', 'File eliminato con successo.');


    res.status(201).json({ message: 'File eliminato con successo' });

  } catch (error) {
    console.error('Errore durante il caricamento e il processamento dei file:', error);
    res.status(500).json({ message: 'Errore durante il caricamento e il processamento dei file.' });
  }
});




// Endpoint di upload
app.post('/upload', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    const user = await UserModel.findOne({ _id: req.user.id });

    if (!user) {
      return res.status(404).json({ message: 'User non trovato o accesso non autorizzato' });
    }

    if (user.n_usage_total > (0 + req.files.length)) {
      // Se è stato fornito, usiamo il nome del foglio inviato dal frontend
      const sheetNames = JSON.parse(req.body.sheetNames); // Leggi l'array dei fogli

      // Ottieni i filtri se presenti
      const selectedFilters = req.body.filters ? JSON.parse(req.body.filters) : [];

      // Array per accumulare gli errori
      const errors = [];
      const savedFiles = [];

      const filePromises = req.files.map(async (file, index) => {
        const { originalname, buffer } = file;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Elenca i nomi dei fogli nel file
        const sheetNamesInFile = workbook.worksheets.map(sheet => sheet.name);

        // Trova il nome del foglio selezionato per il file corrente
        const selectedSheet = sheetNames.find(item => item.fileName === originalname)?.sheetName;

        if (!selectedSheet) {
          errors.push({ fileName: originalname, message: `Foglio non selezionato per il file ${originalname}.` });
          return; // Non inviare risposta qui
        }

        if (!sheetNamesInFile.includes(selectedSheet)) {
          errors.push({ fileName: originalname, message: `Il foglio ${selectedSheet} non esiste nel file ${originalname}. I fogli disponibili sono: ${sheetNamesInFile.join(', ')}` });
          return; // Non inviare risposta qui
        }

        //prima le statistiche
        const {ids, rowCount} = await extractIdsAndRowCountFromFirstColumn(buffer, selectedSheet);
        

        // Se è stato fornito un nome di foglio, lo passiamo a processFile
        const modifiedData = await processFile(buffer, selectedSheet, selectedFilters);

        
        const sheet_used = selectedSheet || sheetNames[0];
        
        // 1. Salva il file originale in FileInModel
        const newFile = new FileInModel({
          user_id: req.userId,
          file_name: originalname,
          file_data: buffer,
          deleted: false,
          sheet_used_name: sheet_used,
          filters_used: selectedFilters.join(','),
          tot_row_processed: rowCount,
          people_processed: ids.join(','),
          total_people_processed: ids.length,
        });
        await newFile.save();

        const modifiedFileName = addSuffixToFilename(originalname, '_modificato');

        // 3. Salva il file modificato in FileOutModel
        const modifiedFile = new FileOutModel({
          user_id: req.userId,
          file_id: newFile._id,
          file_name: modifiedFileName,
          file_data: modifiedData,
        });
        await modifiedFile.save();

        savedFiles.push(modifiedFile); // Aggiungi il file salvato all'array
      });

      await Promise.all(filePromises);

      // Se ci sono errori, invia la risposta con gli errori
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Errore nei file.', errors });
      }

      // Chiama la funzione di creazione log dopo l'operazione
      await createLogDB(req.user.username, 'upload', 'File caricato con successo.');

      user.n_usage_total -= req.files.length;
      await user.save();

      return res.status(201).json({ message: 'File caricati e processati con successo', files: savedFiles }); // UNA SOLA risposta
    } else {
      return res.status(400).json({ message: 'L\'utente ha terminato gli utilizzi a sua disposizione' });
    }
  } catch (error) {
    console.error('Errore durante il caricamento e il processamento dei file:', error);
    return res.status(500).json({ message: 'Errore durante il caricamento e il processamento dei file.' });
  }
});





app.post('/getSheetNames', authenticateToken, upload.single('file'), async (req, res) => {
  try {
      const { buffer } = req.file;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      // Elenca i nomi dei fogli
      const sheetNames = workbook.worksheets.map(sheet => sheet.name);
      
      //console.log("Sheet Names:", sheetNames); 
      res.json(sheetNames); // Restituisce direttamente l'array dei nomi dei fogli
  } catch (error) {
      console.error("Errore nel caricamento dei fogli:", error);
      res.status(500).json({ error: "Errore durante il caricamento dei fogli" });
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

    // Chiama la funzione di creazione log dopo l'operazione
    await createLogDB(req.user.username, 'download', 'File scaricato con successo.');


    res.end(file.file_data);
  } catch (error) {
    console.error('Errore durante il download del file:', error);
    res.status(500).json({ message: 'Errore durante il download del file.' });
  }
});



//api per ritornare solo i nomi dei filtri all'utente
app.post('/getFilters', authenticateToken, upload.array('files'), async (req, res) => {
  try {
      const files = req.files;
      const sheetNames = req.body.sheetNames; // Array dei nomi dei fogli selezionati

      let allFilters = new Set();

      for (let i = 0; i < files.length; i++) {
          const fileBuffer = files[i].buffer;
          const selectedSheetName = Array.isArray(sheetNames) ? sheetNames[i] : sheetNames;

          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(fileBuffer);
          const worksheet = workbook.getWorksheet(selectedSheetName);

          if (!worksheet) {
              return res.status(400).json({ error: `Foglio ${selectedSheetName} non trovato.` });
          }

          // Trova l'indice della colonna "Attività"
          const columns = worksheet.getRow(1).values; // Ottieni i valori della prima riga (intestazioni)
          const activityColumnIndex = columns.indexOf('Attività'); // Trova l'indice della colonna "Attività"

          if (activityColumnIndex === -1) {
              return res.status(400).json({ error: "Colonna 'Attività' non trovata." });
          }

          // Estrai i valori unici dalla colonna "Attività"
          const filterValues = new Set();
          worksheet.eachRow((row, rowIndex) => {
              if (rowIndex === 1) return; // Ignora l'intestazione

              const activityValue = row.getCell(activityColumnIndex).value; // Accedi alla cella con l'indice corretto
              if (activityValue) filterValues.add(activityValue);
          });

          filterValues.forEach(value => allFilters.add(value));
      }

      res.json(Array.from(allFilters)); // Restituisci l'array di filtri unici
  } catch (error) {
      console.error("Errore nel caricamento dei filtri:", error);
      res.status(500).json({ error: "Errore durante il caricamento dei filtri" });
  }
});












//
// Funzioni per la modifica dei file Excel
//


// Funzione per copiare un foglio di lavoro
function copyWorksheet(originalWorksheet, workbook, newSheetName) {
  const newWorksheet = workbook.addWorksheet(newSheetName);
  originalWorksheet.eachRow({ includeEmpty: true }, (row) => {
    const newRow = newWorksheet.addRow(row.values);
    newRow.commit();
  });
  //console.log(`Foglio copiato in "${newSheetName}".`);
  return newWorksheet;
}

// Funzione per controllare se un valore contiene uno degli elementi di un array
function isValueExcluded(value, filterValues) {
  return filterValues.some(filter => value && value.includes(filter));
}

// Funzione per evidenziare righe duplicate e aggiungere il conteggio
function highlightAndCountDuplicates(worksheet, filterValues, newColumn, filteredWorksheet) {
  const lastRow = worksheet.lastRow.number;

  for (let i = 2; i <= lastRow; i++) {
    const currentRow = worksheet.getRow(i);
    const currentID = currentRow.getCell(1).value;
    const cellValueCol6 = currentRow.getCell(6).value;
    const duplicateCount = worksheet.getColumn(1).values.filter(val => val === currentID).length;

    if (duplicateCount > 1 && !isValueExcluded(cellValueCol6, filterValues)) {
      currentRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF7C8080' }, // Colore rosso opaco
        };
      });
      currentRow.getCell(newColumn).value = duplicateCount;
      currentRow.getCell(newColumn).alignment = { horizontal: 'center' }; // Allinea al centro
      currentRow.commit();

      // Copia la riga nel foglio delle righe duplicate
      filteredWorksheet.addRow(currentRow.values).commit();
      //console.log(`Riga ${i} duplicata e copiata in "RigheCoinvolte".`);
    }
  }
}

function sortWorksheetByColumn(worksheet, columnIndex) {
  const rows = worksheet.getSheetValues().slice(2); // Ignora intestazione
  rows.sort((a, b) => (a[columnIndex] > b[columnIndex] ? 1 : -1));
  worksheet.spliceRows(2, worksheet.rowCount - 1, ...rows);
}

// Funzione per ridimensionare le colonne in un foglio
function autoResizeColumns(worksheet) {
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const textLength = cell.value ? cell.value.toString().length : 0;
      maxLength = Math.max(maxLength, textLength);
    });
    column.width = maxLength + 2;
  });
  //console.log(`Colonne ridimensionate per il foglio "${worksheet.name}".`);
}

// Funzione per estrarre gli ID dalla prima colonna
async function extractIdsAndRowCountFromFirstColumn(buffer, selectedSheet) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  // Ottieni il foglio di lavoro selezionato
  const worksheet = workbook.getWorksheet(selectedSheet);

  if (!worksheet) {
    throw new Error(`Il foglio '${selectedSheet}' non esiste nel file.`);
  }

  const ids = new Set();  // Usa un Set per garantire che gli ID siano univoci
  let rowCount = 0;

  // Itera su tutte le righe del foglio di lavoro
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    // Incrementa il contatore delle righe
    rowCount++;

    // Salta la prima riga (intestazione)
    if (rowNumber > 1) {
      const id = row.getCell(1).value;  // Estrai il valore dalla prima colonna
      if (id) {
        ids.add(id);  // Usa add per garantire l'unicità
      }
    }
  });

  return { ids: Array.from(ids), rowCount };
}

// Funzione principale per elaborare il file Excel
// Modifica della funzione processFile per accettare il nome del foglio da usare
async function processFile(buffer, sheetName = null, filters) {
  try {
    console.log('-------');
    console.log('---Inizio elaborazione del file...');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    //console.log('Workbook caricato con successo.');

    let worksheet;

    // Se il nome del foglio è fornito, usalo; altrimenti prendi il primo foglio
    if (sheetName) {
      worksheet = workbook.getWorksheet(sheetName);
    } else if (workbook.worksheets.length === 1) {
      worksheet = workbook.getWorksheet(1);
    } else {
      throw new Error('Il nome del foglio non è specificato e ci sono più fogli.');
    }

    // Qui prosegui con la logica per copiare il foglio, evidenziare duplicati, ecc.
    const modifiedWorksheet = copyWorksheet(worksheet, workbook, 'FoglioModificato');
    const filteredWorksheet = workbook.addWorksheet('RigheCoinvolte');
    filteredWorksheet.addRow(modifiedWorksheet.getRow(1).values).commit();

    //const filterValues = ['STAFF', '--'];
    const filterValues = filters;
    const newColumn = modifiedWorksheet.columnCount + 1;
    highlightAndCountDuplicates(modifiedWorksheet, filterValues, newColumn, filteredWorksheet);

    [modifiedWorksheet, filteredWorksheet].forEach(autoResizeColumns);

    console.log('---Elaborazione completata con successo.');
    console.log('-------');

    return await workbook.xlsx.writeBuffer();

  } catch (error) {
    console.error('Errore durante l\'elaborazione:', error);
    throw error;
  }
}





//
// Dashboard - Admin - Statistiche
//

const statsController = require('./statsController');
app.get('/admin/total-users', statsController.getTotalUsers);
app.get('/admin/file-stats',  statsController.getFileStatistics);
app.get('/admin/recent-logs', statsController.getRecentLogs);




//
// Routes finali
//

// Middleware per verificare l'utente autorizzato
async function verifyAuthorizedUser(req, res, next) {
  try {
    //console.log("entroooooo");

    // Assumi che l'utente sia autenticato e che l'identità sia disponibile nel `req.user`
    if (req.user && req.body.isAdmin == 1) {
      next(); // Passa alla route successiva
    } else {
      console.log(req.body.isAdmin);
      console.log("Utente non abilitato");
      return res.status(403).send('Accesso negato: solo un admin può eseguire questa operazione');
    }
  } catch (error) {
    console.error('Errore durante la verifica dell\'utente:', error);
    res.status(500).send('Errore interno del server');
  }
}

// Route per la registrazione con verifica dell'utente autorizzato
app.post('/register', authenticateToken, verifyAuthorizedUser, async (req, res) => {
  const { username, email, password } = req.body;

  console.log("tentativo--------");

  if (!username || !email || !password) {
    return res.status(400).send('Tutti i campi sono obbligatori');
  }

  try {
    // Controlla se l'utente esiste già
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email già registrata');
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea un nuovo utente
    const newUser = new UserModel({
      username,
      email,
      password_hash: hashedPassword,
    });

    // Salva l'utente nel database
    await newUser.save();
    res.status(201).send('Utente registrato con successo');
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).send('Errore durante la registrazione');
  }
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
