let Matier = require("../models/MatierModel");

let matierCtrl = {
  getAllMatier: async (req, res) => {
    try {
      let findMatier = await Matier.find();

      res.status(200).json({ result: findMatier, success: true, error: false });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message || error, success: false, error: true });
    }
  },
};

module.exports = matierCtrl;
