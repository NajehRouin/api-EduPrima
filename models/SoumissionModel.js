let mongoose = require("mongoose");

const SoumissionSchema = new mongoose.Schema({
  idEleve: {
    type: mongoose.Schema.ObjectId,
    ref: "Eleve",
  },
  fichier: {
    type: String,
    required: true,
  },
  dateDepot: {
    type: Date,
    default: Date.now,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },

  Activite: {
    type: mongoose.Schema.ObjectId,
    ref: "activite",
  },
});

module.exports = mongoose.model("Soumission", SoumissionSchema);
