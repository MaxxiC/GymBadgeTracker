const express = require('express');
const router = express.Router();
const UserModel = require('./db_model/userModel');
const FileInModel = require('./db_model/fileInModel');
const FileOutModel = require('./db_model/fileOutModel');
const FileStatisticsModel = require('./db_model/file_statisticsModel');
const ActionsLogModel = require('./db_model/actions_logModel');

const bcrypt = require('bcryptjs');

const password = 'hashedpassword123';  // La password da hashare

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Errore durante l\'hashing:', err);
    } else {
        console.log('Password hashata:', hash);
    }
});

// Route per creare un utente di test e riempire le collezioni
router.get('/testuser', async (req, res) => {
  try {
    // Step 1: Controlla se l'utente esiste
    let existingUser = await UserModel.findOne({ username: 'testuser123' });

    if (!existingUser) {
      // Step 2: Se l'utente non esiste, crea un nuovo utente
      const newUser = new UserModel({
        username: 'testuser123',
        email: 'testuser123@example.com',
        password_hash: password,  // Assumi che la password sia già hashata
        profile_image: null,  // Nessuna immagine per questo test
      });

      // Salva il nuovo utente
      const savedUser = await newUser.save();

      // Step 3: Crea un nuovo file di input per l'utente
      const newFileIn = new FileInModel({
        user_id: savedUser._id,
        file_name: 'example_input.xlsx',
        file_data: Buffer.from('Excel data in binary'),  // Simula dati binari
        rows_processed: 50,
      });
      const savedFileIn = await newFileIn.save();

      // Step 4: Crea una statistica collegata al file
      const newFileStat = new FileStatisticsModel({
        file_id: savedFileIn._id,
        total_rows: 600,
        processed_rows: 50,
      });
      await newFileStat.save();

      // Step 5: Crea un file di output per l'utente collegato al file di input
      const newFileOut = new FileOutModel({
        user_id: savedUser._id,
        file_id: savedFileIn._id,
        file_name: 'example_output.xlsx',
        file_data: Buffer.from('Processed Excel data in binary'),  // Simula dati binari
        n_download: 0,
      });
      await newFileOut.save();

      // Step 6: Logga un'azione di caricamento (upload)
      const newActionLog = new ActionsLogModel({
        user_id: savedUser._id,
        action_type: 'upload',
        file_id: savedFileIn._id,
      });
      await newActionLog.save();

      res.status(201).json({ message: 'Test user and associated data created successfully.' });
    } else {
      res.status(200).json({ message: 'User already exists. No action taken.' });
    }
  } catch (error) {
    console.error("Error in /testuser route:", error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

module.exports = router;
