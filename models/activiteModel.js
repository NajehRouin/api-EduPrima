let mongoose = require("mongoose");

let ActiviteSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateCreation: { type: Date, default: Date.now, required: true },
  dateLimite: { type: Date, required: true },
  idCours: {
    type: mongoose.Schema.ObjectId,
    ref: "cours",
  },

  etat: {
    type: String,
    enum: ["en_cours", "termine"],
    default: "en_cours",
  },

  depot: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Soumission",
    },
  ],
  commentaire: [],
});

module.exports = mongoose.model("activite", ActiviteSchema);
