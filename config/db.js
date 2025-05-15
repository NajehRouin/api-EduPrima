const mongoose = require("mongoose");
const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connecté à MongoDB avec succès");
    })
    .catch((err) => {
      console.error("Erreur de connexion à MongoDB :", err);
      process.exit(1); // Quitter l'application en cas d'échec de connexion
    });
};
module.exports = connectDB;
