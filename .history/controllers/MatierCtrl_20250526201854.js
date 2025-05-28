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

  AjouterMatier: async (req, res) => {
    try {
      let { label } = req.body;

      let findMatier = await Matier.findOne({ label });

      if (findMatier)
        return res.status(400).json({ msg: "Matier déja existe" });

      let newMatier = new Matier({ label });
      await newMatier.save();

      res.status(200).json({
        msg: "Matier créer avec sucées ",
        result: newMatier,
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },
};

module.exports = matierCtrl;
