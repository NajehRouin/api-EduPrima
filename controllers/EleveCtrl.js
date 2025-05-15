const Eleve = require("../models/EleveModel");
const bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
const AdminModel = require("../models/AdminModel");
const EnseignantModel = require("../models/EnseignantModel");
const SoumissionModel = require("../models/SoumissionModel");
const classeModel = require("../models/classeModel");
const EleveCtrl = {
  login: async (req, res) => {
    try {
      let { email, motDePasse } = req.body;
      let findEleve = await Eleve.findOne({ email });
      if (!findEleve)
        return res.status(400).json({ message: "email incorrect" });

      let compare = await bcrypt.compare(motDePasse, findEleve.motDePasse);
      if (!compare)
        return res.status(302).json({ message: "mot de passe incorrect" });

      const tokenData = {
        _id: findEleve._id,
        email: findEleve.email,
        eleveId: findEleve._id,
      };

      const token = await jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 60 * 60 * 2,
      });

      const tokenOption = {
        httpOnly: true,
        secure: true,
      };

      res.cookie("token", token, tokenOption).status(200).json({
        message: "login Success",
        eleve: findEleve,
        data: token,
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message || error, success: false, error: true });
    }
  },

  createEleve: async (req, res) => {
    try {
      const { nom, email, motDePasse, classe } = req.body;

      let findEleve = await Eleve.findOne({ email });
      if (findEleve) return res.status(400).json({ msg: "Eleve déja existe" });
      let passwordHash = await bcrypt.hash(motDePasse, 10);

      const newEleve = await Eleve.createEleve({
        nom,
        email,
        motDePasse: passwordHash,
        classe,
      });

      res.status(200).json({
        msg: "Eleve créer avec sucées ",
        result: newEleve,
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  getAllEleve: async (req, res) => {
    try {
      const findAdmin = await AdminModel.findById(req.admin);
      if (!findAdmin) return res.status(400).json({ msg: "Please Login....!" });

      let findEleve = await Eleve.find().populate("classe");

      // Regrouper par classe
      const grouped = {};

      findEleve?.forEach((eleve) => {
        if (eleve?.classe) {
          const key = `${eleve.classe.nomClasse}-${eleve.classe.niveau}`;

          if (!grouped[key]) {
            grouped[key] = {
              nomClasse: eleve.classe.nomClasse,
              niveau: eleve.classe.niveau,
              _id: eleve.classe._id,

              eleves: [],
            };
          }

          grouped[key]?.eleves?.push({
            _id: eleve._id,
            nom: eleve.nom,
            email: eleve.email,
          });
        }
      });

      res
        .status(200)
        .json({ result: Object.values(grouped), success: true, error: false });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message || error, success: false, error: true });
    }
  },

  supprimerEleve: async (req, res) => {
    try {
      const { idEleve } = req.body;

      const findEleve = await Eleve.findById(idEleve);
      if (!findEleve) {
        return res.status(404).json({ error: "Élève non trouvé." });
      }

      // Supprimer les soumissions associées
      await SoumissionModel.deleteMany({ idEleve: findEleve._id });

      // Supprimer l'élève
      await Eleve.findByIdAndDelete(idEleve);

      res.json({
        message:
          "Élève et toutes les données associées supprimées avec succès.",
      });
    } catch (error) {
      res.status(500).json({
        error: "Une erreur est survenue lors de la suppression de l'élève.",
      });
    }
  },

  modifierEleve: async (req, res) => {
    try {
      const { idEleve, nom, email, motDePasse } = req.body;

      const updateFields = {
        nom,
        email,
      };

      if (motDePasse && motDePasse.trim() !== "") {
        const passwordHash = await bcrypt.hash(motDePasse, 10);
        updateFields.motDePasse = passwordHash;
      }

      const updatedEleve = await Eleve.findByIdAndUpdate(
        idEleve,
        updateFields,
        {
          new: true,
        }
      );

      if (!updatedEleve) {
        return res.status(404).json({
          msg: "Élève non trouvé.",
          success: false,
          error: true,
        });
      }

      res.status(200).json({
        msg: "Élève modifié avec succès.",
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

module.exports = EleveCtrl;
