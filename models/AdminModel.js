const mongoose = require("mongoose");
const utilisateurSchema = require("./utilisateur");

const adminSchema = new mongoose.Schema({
  ...utilisateurSchema.obj,
});

// Valeur par défaut pour le rôle
adminSchema.statics.createAdmin = function (data) {
  return this.create({ ...data, role: "Admin" });
};

module.exports = mongoose.model("Admin", adminSchema);
