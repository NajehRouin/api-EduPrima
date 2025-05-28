let specialite = require("../models/SpecilateModel");

let specialiteCtrl = {
  getAllSpecialite: async (req, res) => {
    try {
      let findSpecialite = await specialite.find();

      res
        .status(200)
        .json({ result: findSpecialite, success: true, error: false });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message || error, success: false, error: true });
    }
  },

  AjouterSpecilate: async (req, res) => {
    try {
      let { label } = req.body;

      let findSpecialite = await specialite.findOne({ label });

      if (findSpecialite)
        return res.status(400).json({ msg: "Specialite déja existe" });

      let newSpecilate = new specialite({ label });
      await newSpecilate.save();

      res.status(200).json({
        msg: "Specilate créer avec sucées ",
        result: newSpecilate,
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

module.exports = specialiteCtrl;
