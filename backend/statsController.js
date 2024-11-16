const UserModel = require('./db_model/userModel');
const FileInModel = require('./db_model/fileInModel');
const FileOutModel = require('./db_model/fileOutModel');
const LoggerModel = require('./db_model/loggerModel');

// Totale degli utenti iscritti
const getTotalUsers = async (req, res) => {
  try {
    //totale user esistenti
    const totalUsers = await UserModel.countDocuments({});

    //totale utenti attivati
    //(appena creati hanno first_login null, 
    //appena viene effettuato almeno 1 login divena pieno)
    const tmpTotalActivatedUser = await UserModel.aggregate([
      { $match: { first_login: { $ne: null } } },
      { $group: { _id: null, total: { $sum: "$first_login" } } }
    ]);
    
    const totalActivatedUser = tmpTotalActivatedUser[0]?.total || 0;

    //totali utenti attivi
    const lastHourLogins = await UserModel.countDocuments({ latest_login: { $gte: new Date(Date.now() - 60 * 60 * 1000) } });
    const lastTotHoursLogins = await UserModel.countDocuments({ latest_login: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });

    //Totali n_usage degli utenti "attivi" (almeno 1 login)
    const totalUsageLeft = await UserModel.aggregate([
      { $match: { first_login: { $ne: null } } },
      { $group: { _id: null, total: { $sum: "$n_usage_total" } } }
    ]);

    //Totale numero login
    const totalLogin = await UserModel.aggregate([
      { $group: { _id: null, total: { $sum: "$total_login" } } }
    ]);

    res.json({ 
      totalUsers,
      totalActivatedUser,
      lastHourLogins,
      lastTotHoursLogins,
      totalUsageLeft: totalUsageLeft[0]?.total || 0,
      totalLogin: totalLogin[0]?.total || 0,
     });

  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei dati', error });
  }
};

// Totale dei file, file cancellati e altre metriche
const getFileStatistics = async (req, res) => {
  try {
    const totalFiles = await FileInModel.countDocuments({});
    const deletedFiles = await FileInModel.countDocuments({ deleted: true });
    const totalRows = await FileInModel.aggregate([{ $group: { _id: null, totalRows: { $sum: "$tot_row_processed" } } }]);
    const uniquePeople = await FileInModel.aggregate([{ $group: { _id: null, uniquePeople: { $sum: "$total_people_processed" } } }]);
    const totalDownloadOut = await FileOutModel.aggregate([{ $group: { _id: null, total: { $sum: "$n_download" } } }]);


    res.json({
      totalFiles,
      deletedFiles,
      totalRows: totalRows[0]?.totalRows || 0,
      uniquePeople: uniquePeople[0]?.uniquePeople || 0,
      totalDownloadOut: totalDownloadOut[0]?.total || 0,
    });

  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero delle statistiche', error });
  }
};

// Ultimi log
const getRecentLogs = async (req, res) => {
  try {
      const { filterLogs } = req.query; // Recupera il filtro dalla query

      const query = filterLogs && filterLogs !== 'all' 
          ? { log_type: filterLogs } // Filtro per il tipo specifico
          : {}; // Nessun filtro se "all"

      const recentLogs = await LoggerModel.find(query)
          .sort({ created_at: -1 })
          .limit(10)
          .exec();

      res.json({ recentLogs });
  } catch (error) {
      res.status(500).json({ message: 'Errore nel recupero dei log', error });
  }
};

module.exports = { getTotalUsers, getFileStatistics, getRecentLogs };
