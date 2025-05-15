const EleveModel = require("../models/EleveModel");
const EnseignantModel = require("../models/EnseignantModel");
const Soumission = require("../models/SoumissionModel");
const Activites = require("../models/activiteModel");

const SoumissionCtrl = {
  createDepot: async (req, res) => {
    try {
      let { Activite } = req.body;
      let findEeleve = await EleveModel.findById({ _id: req.eleve });

      if (!findEeleve)
        return res.status(500).json({ msg: "Veuillez vous connecter....!" });

      const fichier = req.file;

      if (!fichier) {
        return res.status(400).json({ msg: "Aucun fichier n'a été envoyé." });
      }
      const newSoumission = new Soumission({
        idEleve: req.eleve,
        Activite,
        fichier: `http://localhost:${process?.env?.PORT}/soumission/${fichier?.filename}`,
      });
      await newSoumission.save();

      let updatedActivite = await Activites.findByIdAndUpdate(
        Activite,
        { $push: { depot: newSoumission._id } },
        { new: true }
      );

      res.status(201).json({
        msg: "Votre dépôt a été envoyé avec succès.",
        Soumission: newSoumission,
        success: true,
        error: false,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message, success: false, error: true });
    }
  },

  AjouterNote: async (req, res) => {
    try {
      let { id, note } = req.body;
      let findEnseignant = await EnseignantModel.findById({
        _id: req.enseignant,
      });
      if (!findEnseignant)
        return res.status(500).json({ error: "Veuillez vous connecter....!" });

      let findSoumission = await Soumission.findByIdAndUpdate(
        { _id: id },
        { note: note }
      );
      res.status(201).json({
        message: "La note a été modifiée avec succès",
        Soumission: findSoumission,
        success: true,
        error: false,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: error.message, success: false, error: true });
    }
  },

  getDepotByEleve: async (req, res) => {
    try {
      let { idActivite } = req.body;
      let findEeleve = await EleveModel.findById({ _id: req.eleve });
      if (!findEeleve)
        return res.status(500).json({ error: "Veuillez vous connecter....!" });

      let findActivite = await Activites.findById({ _id: idActivite }).populate(
        {
          path: "depot",
          populate: {
            path: "idEleve",
            select: "nom email classe",
          },
        }
      );

      if (!findActivite) {
        return res.status(404).json({ error: "Activité introuvable." });
      }

      // Filtrer les dépôts pour ne garder que ceux de l'élève connecté
      const filteredDepot = findActivite.depot.filter(
        (d) => d.idEleve?._id?.toString() === req.eleve.toString()
      );

      // Remplacer le tableau original par le tableau filtré
      findActivite = {
        ...findActivite.toObject(),
        depot: filteredDepot,
      };

      res.status(200).json({ result: findActivite });
    } catch (error) {
      res
        .status(500)
        .json({ error: error.message, success: false, error: true });
    }
  },

  modifierDepot: async (req, res) => {
    try {
      const { idDepot } = req.body;

      const fichier = req.file;

      if (!fichier) {
        return res.status(400).json({ msg: "Aucun fichier n'a été envoyé." });
      }

      let findDepot = await Soumission.findByIdAndUpdate(
        { _id: idDepot },
        {
          fichier: `http://localhost:${process?.env?.PORT}/soumission/${fichier?.filename}`,
        }
      );

      res.status(201).json({
        msg: "Votre dépôt a été envoyé avec succès.",

        success: true,
        error: false,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message, success: false, error: true });
    }
  },

  getAllDepot: async (req, res) => {
    try {
      let findDepot = await Activites.find();
      res.json({ result: findDepot });
    } catch (error) {
      return;
    }
  },
};

module.exports = SoumissionCtrl;
