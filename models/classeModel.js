const mongoose = require("mongoose");

const classesSchema = new mongoose.Schema({
  nomClasse: {
    type: String,
    required: true,
  },
  niveau: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("classe", classesSchema);
