let mongoose = require("mongoose");

let MatierSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("matier", MatierSchema);
