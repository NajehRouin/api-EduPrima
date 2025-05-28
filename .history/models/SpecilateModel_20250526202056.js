let mongoose = require("mongoose");

let SpecialteSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("specialite", SpecialteSchema);
