const mongoose = require("mongoose");

const CoursSchema = new mongoose.Schema({
  enseignantId: {
    type: mongoose.Schema.ObjectId,
    ref: "Enseignant",
  },
  titre: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateCreation: { type: Date, default: Date.now, required: true },

  classe: {
    type: mongoose.Schema.ObjectId,
    ref: "classe",
  },

  resource: {
    type: mongoose.Schema.ObjectId,
    ref: "resource",
  },

  activites: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "activite",
    },
  ],
});

module.exports = mongoose.model("cours", CoursSchema);
