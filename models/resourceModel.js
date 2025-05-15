const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  nomFichier: {
    type: String,
    required: true,
  },

  lienUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("resource", ResourceSchema);
