const mongoose = require("mongoose");

const utilisateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Enseignant", "Eleve"],
      required: true,
    },
  },
  { _id: false }
);

module.exports = utilisateurSchema;
