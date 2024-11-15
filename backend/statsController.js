const UserModel = require('./db_model/userModel');
const FileInModel = require('./db_model/fileInModel');
const FileOutModel = require('./db_model/fileOutModel');
const LoggerModel = require('./db_model/loggerModel');

// Totale degli utenti iscritti
const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments({});
    const lastHourLogins = await UserModel.countDocuments({ latest_login: { $gte: new Date(Date.now() - 60 * 60 * 1000) } });
    const last12HoursLogins = await UserModel.countDocuments({ latest_login: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } });
    res.json({ totalUsers, lastHourLogins, last12HoursLogins });
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

    res.json({
      totalFiles,
      deletedFiles,
      totalRows: totalRows[0]?.totalRows || 0,
      uniquePeople: uniquePeople[0]?.uniquePeople || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero delle statistiche', error });
  }
};

// Ultimi log
const getRecentLogs = async (req, res) => {
  try {
    const recentLogs = await LoggerModel.find().sort({ created_at: -1 }).limit(10).exec();
    res.json({ recentLogs });
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei log', error });
  }
};

module.exports = { getTotalUsers, getFileStatistics, getRecentLogs };
