const Enseignant = require("../models/EnseignantModel");
const bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
const AdminModel = require("../models/AdminModel");
const EleveModel = require("../models/EleveModel");
const EnseignantCtrl = {
  login: async (req, res) => {
    try {
      let { email, motDePasse } = req.body;
      let findEnseignant = await Enseignant.findOne({ email }).populate(
        "classes"
      );
      if (!findEnseignant)
        return res.status(400).json({ msg: "email incorrect" });

      let compare = await bcrypt.compare(motDePasse, findEnseignant.motDePasse);
      if (!compare)
        return res.status(302).json({ message: "mot de passe incorrect" });

      const tokenData = {
        _id: findEnseignant._id,
        email: findEnseignant.email,
        enseignantId: findEnseignant._id,
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
        enseignant: findEnseignant,
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

  AjouterEnseignant: async (req, res) => {
    try {
      const { nom, email, motDePasse, specialite, classes } = req.body;

      // Vérifier si l'enseignant existe déjà
      const findEnseignant = await Enseignant.findOne({ email });
      if (findEnseignant) {
        return res.status(400).json({ msg: "Enseignant déjà existe" });
      }

      // Vérifier les doublons dans les classes
      const uniqueClasses = [...new Set(classes.map(String))]; // supprime les doublons

      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(motDePasse, 10);

      // Créer l'enseignant avec les classes uniques
      const newEnseignant = await Enseignant.createEnseignant({
        nom,
        email,
        motDePasse: passwordHash,
        specialite,
        classes: uniqueClasses,
      });

      res.status(200).json({
        msg: "Enseignant créé avec succès",
        result: newEnseignant,
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  getAllEnseignant: async (req, res) => {
    try {
      const findAdmin = await AdminModel.findById(req.admin);
      if (!findAdmin) return res.status(400).json({ msg: "Please Login....!" });
      const enseignants = await Enseignant.find().populate("classes");

      const grouped = {};

      enseignants.forEach((enseignant) => {
        enseignant.classes.forEach((classe) => {
          const key = classe._id.toString();

          if (!grouped[key]) {
            grouped[key] = {
              _id: classe._id,
              nomClasse: classe.nomClasse,
              niveau: classe.niveau,
              enseignants: [],
            };
          }

          grouped[key].enseignants.push({
            _id: enseignant._id,
            nom: enseignant.nom,
            email: enseignant.email,
            specialite: enseignant.specialite,
          });
        });
      });

      const result = Object.values(grouped);

      res.status(200).json({
        result,
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  currentEnseignant: async (req, res) => {
    try {
      let findEnseignant = await Enseignant.findById({
        _id: req.enseignant,
      }).populate("classes");

      res.json({ result: findEnseignant, success: true, error: false });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  getEnseignantSeidBar: async (req, res) => {
    try {
      const findEleve = await EleveModel.findById(req.eleve);

      if (!findEleve)
        return res.status(500).json({ error: "Veuillez vous connecter....!" });

      const enseignantsFiltrés = await Enseignant.find({
        classes: findEleve.classe,
      }).select("nom specialite");
      res.json({ result: enseignantsFiltrés });
    } catch (error) {}
  },

  getEnseignantById: async (req, res) => {
    try {
      let { idEnseignant } = req.body;

      let findEnseignant = await Enseignant.findById({
        _id: idEnseignant,
      }).populate("classes");

      res.status(200).json({
        result: findEnseignant,
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

module.exports = EnseignantCtrl;
