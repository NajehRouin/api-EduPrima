const Enseignant = require("../models/EnseignantModel");
const bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
const AdminModel = require("../models/AdminModel");
const EleveModel = require("../models/EleveModel");
const CoursModel = require("../models/CoursModel");
const resourceModel = require("../models/resourceModel");
const activiteModel = require("../models/activiteModel");
const SoumissionModel = require("../models/SoumissionModel");
const EnseignantCtrl = {
  login: async (req, res) => {
    try {
      let { email, motDePasse } = req.body;
      let findEnseignant = await Enseignant.findOne({ email }).populate(
        "classes"
      );
      if (!findEnseignant)
        return res.status(400).json({ message: "email incorrect" });

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
      })
        .select("-motDePasse -role")
        .populate("classes");

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

  updateEnseignant: async (req, res) => {
    try {
      const { idEnseignant, nom, email, motDePasse, specialite, classes } =
        req.body;

      // Validate required fields
      if (
        !idEnseignant ||
        !nom ||
        !email ||
        !specialite ||
        !classes ||
        !Array.isArray(classes)
      ) {
        return res.status(400).json({
          msg: "Tous les champs obligatoires (idEnseignant, nom, email, specialite, classes) doivent être fournis",
          success: false,
          error: true,
        });
      }

      // Prepare update data
      const updateData = {
        nom,
        email,
        specialite,
        classes,
      };

      // Only update password if provided
      if (motDePasse) {
        const salt = await bcrypt.genSalt(10);
        updateData.motDePasse = await bcrypt.hash(motDePasse, salt);
      }

      // Update the teacher
      const updatedEnseignant = await Enseignant.findByIdAndUpdate(
        idEnseignant,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("classes");

      if (!updatedEnseignant) {
        return res.status(404).json({
          msg: "Enseignant non trouvé",
          success: false,
          error: true,
        });
      }

      res.json({
        result: updatedEnseignant,
        success: true,
        error: false,
      });
    } catch (error) {
      res.status(500).json({
        msg: error.message,
        success: false,
        error: true,
      });
    }
  },

  deleteEnseignant: async (req, res) => {
    try {
      let { idEnseignant } = req.body;
      // Find all courses for the teacher
      const cours = await CoursModel.find({ enseignantId: idEnseignant });

      // Iterate through each course
      for (const cour of cours) {
        // Delete resources
        if (cour.resource) {
          await resourceModel.findByIdAndDelete(cour.resource);
        }

        // Delete submissions and activities
        if (cour.activites && cour.activites.length > 0) {
          // Iterate through each activity
          for (const activiteId of cour.activites) {
            // Delete all submissions linked to this activity
            await SoumissionModel.deleteMany({ Activite: activiteId });
          }
          // Delete all activities
          await activiteModel.deleteMany({ _id: { $in: cour.activites } });
        }

        // Delete the course itself
        await CoursModel.findByIdAndDelete(cour._id);
      }

      // Delete the Enseignant
      await Enseignant.findByIdAndDelete(idEnseignant);
      res.json({
        success: true,
        error: false,
        message:
          "Enseignant et toutes les données associées supprimées avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'Enseignant :", error);
      res.status(500).json({
        message:
          "Une erreur est survenue lors de la suppression de l'Enseignant.",
        success: false,
        error: true,
      });
    }
  },
};

module.exports = EnseignantCtrl;
