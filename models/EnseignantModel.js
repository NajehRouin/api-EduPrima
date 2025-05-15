const mongoose = require("mongoose");
const utilisateurSchema = require("./utilisateur");

const enseignantSchema = new mongoose.Schema({
  ...utilisateurSchema.obj,
  specialite: {
    type: String,
    required: true,
  },

  classes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "classe",
    },
  ],
});

enseignantSchema.statics.createEnseignant = function (data) {
  return this.create({ ...data, role: "Enseignant" });
};

module.exports = mongoose.model("Enseignant", enseignantSchema);
