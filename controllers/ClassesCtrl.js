const activiteModel = require("../models/activiteModel");
const AdminModel = require("../models/AdminModel");
const Classe = require("../models/classeModel");
const CoursModel = require("../models/CoursModel");
const EleveModel = require("../models/EleveModel");
const EnseignantModel = require("../models/EnseignantModel");
const resourceModel = require("../models/resourceModel");
const SoumissionModel = require("../models/SoumissionModel");

const ClasseCtrl = {
  createClasses: async (req, res) => {
    try {
      let { nomClasse, niveau } = req.body;

      // Contrôles de saisie
      if (!nomClasse || nomClasse.trim() === "") {
        return res.status(400).json({
          msg: "Le nom de la classe est obligatoire",
          success: false,
          error: true,
          field: "nomClasse",
        });
      }

      if (!niveau || niveau.trim() === "") {
        return res.status(400).json({
          msg: "Le niveau est obligatoire",
          success: false,
          error: true,
          field: "niveau",
        });
      }

      // Vérifier si une classe avec le même nom ET le même niveau existe déjà
      let findClasse = await Classe.findOne({
        nomClasse: nomClasse,
        niveau: niveau,
      });

      if (findClasse) {
        return res.status(400).json({
          msg: "Une classe avec ce nom et ce niveau existe déjà",
          success: false,
          error: true,
        });
      }

      const newClasse = new Classe({ nomClasse, niveau });
      await newClasse.save();

      res.status(200).json({
        msg: "Classe créée avec succès",
        result: newClasse,
        success: true,
        error: false,
      });
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
        success: false,
        error: true,
      });
    }
  },

  getAllClasse: async (req, res) => {
    try {
      const findAdmin = await AdminModel.findById(req.admin);
      if (!findAdmin) return res.status(400).json({ msg: "Please Login....!" });
      let findClasse = await Classe.find();

      res.status(200).json({ result: findClasse });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getAllClasseByEleve: async (req, res) => {
    try {
      const findAdmin = await AdminModel.findById(req.admin);
      if (!findAdmin) return res.status(400).json({ msg: "Please Login....!" });

      // Récupérer toutes les classes
      const classes = await Classe.find();

      // Pour chaque classe, compter le nombre d'élèves
      const classesWithStudentCount = await Promise.all(
        classes.map(async (classe) => {
          const studentCount = await EleveModel.countDocuments({
            classe: classe._id,
          });
          return {
            _id: classe._id,
            nomClasse: classe.nomClasse, // Supposant que votre modèle Classe a un champ 'nom'
            niveau: classe.niveau, // Supposant que votre modèle Classe a un champ 'niveau'
            nombreEleves: studentCount,
          };
        })
      );

      res.status(200).json({ result: classesWithStudentCount });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getclasseEnseignant: async (req, res) => {
    try {
      const findEnseignant = await EnseignantModel.findById(
        req.enseignant
      ).populate("classes");

      if (!findEnseignant)
        return res.status(400).json({ msg: "Please Login....!" });

      const findEleve = await EleveModel.find();

      const groupedClasses = findEnseignant.classes.map((classe) => {
        const elevesDeCetteClasse = findEleve.filter(
          (eleve) => eleve.classe.toString() === classe._id.toString()
        );

        return {
          nomClasse: classe?.nomClasse,
          niveau: classe?.niveau,
          _id: classe?._id,
          eleves: elevesDeCetteClasse?.map((eleve) => ({
            _id: eleve?._id,
            nom: eleve?.nom,
            email: eleve?.email,
          })),
        };
      });

      res.status(200).json({ classesGroupées: groupedClasses });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erreur serveur." });
    }
  },

  modifierclass: async (req, res) => {
    try {
      let { idClass, nomClasse, niveau } = req.body;

      // Contrôles de saisie
      if (!nomClasse || nomClasse.trim() === "") {
        return res.status(400).json({
          msg: "Le nom de la classe est obligatoire",
          success: false,
          error: true,
          field: "nomClasse",
        });
      }

      if (!niveau || niveau.trim() === "") {
        return res.status(400).json({
          msg: "Le niveau est obligatoire",
          success: false,
          error: true,
          field: "niveau",
        });
      }

      let findClassAndUpdate = await Classe.findByIdAndUpdate(
        { _id: idClass },
        { nomClasse, niveau }
      );
      res.status(200).json({
        msg: "classe modifier avec succès",
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },
  deleteClasse: async (req, res) => {
    try {
      const { idClass } = req.body;

      // // Trouver les cours de la classe
      const cours = await CoursModel.find({ classe: idClass });

      // // Supprimer les ressources et les activités liées à chaque cours
      for (const cour of cours) {
        // Supprimer les ressources
        if (cour.resource) {
          await resourceModel.findByIdAndDelete(cour.resource);
        }

        //   // Supprimer les activités
        if (cour.activites && cour.activites.length > 0) {
          await activiteModel.deleteMany({ _id: { $in: cour.activites } });
        }

        //   // Supprimer le cours lui-même
        await CoursModel.findByIdAndDelete(cour._id);
      }

      // // Trouver les élèves de la classe
      const eleves = await EleveModel.find({ classe: idClass });

      // // Pour chaque élève, supprimer ses soumissions
      for (const eleve of eleves) {
        await SoumissionModel.deleteMany({ idEleve: eleve._id });
        await EleveModel.findByIdAndDelete(eleve._id);
      }

      // Supprimer l'idClasse du tableau "classes" des enseignants
      await EnseignantModel.updateMany(
        { classes: idClass },
        { $pull: { classes: idClass } }
      );
      // Supprimer la classe
      await Classe.findByIdAndDelete(idClass);

      res.json({
        message:
          "Classe et toutes les données associées supprimées avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la classe :", error);
      res.status(500).json({
        error: "Une erreur est survenue lors de la suppression de la classe.",
      });
    }
  },
};

module.exports = ClasseCtrl;
