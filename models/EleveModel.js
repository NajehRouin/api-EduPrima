const mongoose = require("mongoose");
const utilisateurSchema = require("./utilisateur");
const eleveSchema = new mongoose.Schema({
  ...utilisateurSchema.obj,
  classe: {
    type: mongoose.Schema.ObjectId,
    ref: "classe",
  },
});

eleveSchema.statics.createEleve = function (data) {
  return this.create({ ...data, role: "Eleve" });
};

module.exports = mongoose.model("Eleve", eleveSchema);
