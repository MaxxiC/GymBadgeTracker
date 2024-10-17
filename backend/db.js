const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDB() {
  try {
    // Collega a MongoDB usando la connessione Mongoose
    await mongoose.connect(uri, clientOptions);
    console.log("Successfully connected to the GymBadgeTracker database!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);  // Esce se la connessione fallisce
  }
}

// Esporta la funzione in modo che possa essere usata altrove
module.exports = connectDB;
