const Activite = require("../models/activiteModel");

const updateActivitesEtat = async () => {
  const now = new Date();
  console.log("date", now);
  try {
    const result = await Activite.updateMany(
      {
        dateLimite: { $lte: now },
        etat: "en_cours",
      },
      {
        $set: { etat: "termine" },
      }
    );

    console.log(
      `${result.modifiedCount} activité(s) mise(s) à jour comme 'termine'.`
    );
    return result;
  } catch (error) {
    console.error("Erreur de mise à jour des activités :", error);
    throw error;
  }
};

module.exports = updateActivitesEtat;
