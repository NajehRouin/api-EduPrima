const EnseignantModel = require("../models/EnseignantModel");
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

  modifierSpecialite: async (req, res) => {
    try {
      let { label, idSpecialite } = req.body;
      let findSpecialite = await specialite.findById({ _id: idSpecialite });
      // Update EnseignantModel documents
      const findEnseignant = await EnseignantModel.updateMany(
        { specialite: findSpecialite.label },
        { specialite: label }
      );
      console.log("first", findEnseignant);
      await specialite.findByIdAndUpdate(
        { _id: idSpecialite },
        { label: label }
      );

      res.status(200).json({
        msg: "specialite modifier avec sucées",
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
