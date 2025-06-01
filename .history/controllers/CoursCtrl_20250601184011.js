const activiteModel = require("../models/activiteModel");
const Cours = require("../models/CoursModel");
const EleveModel = require("../models/EleveModel");
const resourceModel = require("../models/resourceModel");
const SoumissionModel = require("../models/SoumissionModel");
const { path } = require("../models/utilisateur");

const CoursCtrl = {
  createCours: async (req, res) => {
    try {
      let { titre, description, dateCreation, classe } = req.body;

      let newCours = new Cours({
        enseignantId: req.enseignant,
        titre,
        description,
        dateCreation,
        classe,
      });
      await newCours.save();

      res.status(200).json({
        result: newCours,
        msg: "Cour créé avec succès ",
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  getCoursEnseignant: async (req, res) => {
    try {
      // Trouver les cours associés à l'enseignant
      let findCours = await Cours.find({
        enseignantId: req.enseignant,
      })
        .populate("classe") // Charger la classe liée au cours
        .populate("resource") // Charger la ressource liée au cours
        .populate("activites"); // Charger les activités liées au cours

      // Regrouper les cours par nomClasse et niveau
      const classesGroupées = findCours.reduce((acc, cours) => {
        const { nomClasse, niveau, _id } = cours.classe;
        const {
          _id: coursId, // ID du cours
          titre,
          description,
          dateCreation,
          resource,
          activites,
        } = cours;

        // Si la classe n'existe pas encore dans l'objet accumulé, la créer
        if (
          !acc.some(
            (classe) =>
              classe.nomClasse === nomClasse && classe.niveau === niveau
          )
        ) {
          acc.push({
            nomClasse,
            niveau,
            _id,
            cours: [], // Liste des cours pour cette classe
          });
        }

        // Ajouter les détails du cours à la classe correspondante
        const classeIndex = acc.findIndex(
          (classe) => classe.nomClasse === nomClasse && classe.niveau === niveau
        );

        if (classeIndex !== -1) {
          acc[classeIndex].cours.push({
            _id: coursId, // Ajout de l'ID du cours ici
            titre,
            description,
            dateCreation,
            resource,
            activites,
          });
        }

        return acc;
      }, []);

      // Retourner les cours regroupés par classe avec les détails de chaque cours
      res.status(200).json({
        result: classesGroupées,
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  getActivitesbyCours: async (req, res) => {
    try {
      const { idCours } = req.body;
      let findCours = await Cours.findById({ _id: idCours }).populate(
        "activites"
      );
      res.json({ result: findCours.activites });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  listOfCoursByEleve: async (req, res) => {
    try {
      const findEleve = await EleveModel.findById(req.eleve);
      if (!findEleve) return res.status(400).json({ msg: "Please Login....!" });

      const findCours = await Cours.find({ classe: findEleve.classe })
        .populate("enseignantId", "nom email specialite")
        .populate("resource")
        .populate({
          path: "activites",
          populate: {
            path: "depot",
            populate: {
              path: "idEleve",
              select: "nom email classe", // ou tout ce que tu veux garder
            },
          },
        });

      // 💡 Filtrer les dépôts par élève dans chaque activité
      const coursFiltres = findCours.map((cours) => {
        const activitesFiltrees = cours.activites.map((activite) => {
          const depotsFiltres = activite.depot.filter(
            (depot) => depot?.idEleve?._id.toString() === req.eleve
          );
          return {
            ...activite.toObject(),
            depot: depotsFiltres,
          };
        });

        return {
          ...cours.toObject(),
          activites: activitesFiltrees,
        };
      });

      res.status(200).json({
        result: coursFiltres,
        success: true,
        error: false,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message, success: false, error: true });
    }
  },

  getCoursById: async (req, res) => {
    try {
      const { idCours } = req.body;
      let findCours = await Cours.findById({ _id: idCours }).populate({
        path: "activites",
        populate: {
          path: "depot",
        },
      });
      res.json({ result: findCours });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  deleteCoursById: async (req, res) => {
    try {
      const { idCours } = req.body;

      // Étape 1 : Rechercher le cours avec ses activités et dépôts
      const findCours = await Cours.findById(idCours).populate({
        path: "activites",
        populate: {
          path: "depot",
        },
      });

      if (!findCours) {
        return res
          .status(404)
          .json({ msg: "Cours non trouvé", success: false });
      }

      if (findCours.resource) {
        await resourceModel.findByIdAndDelete(findCours.resource);
      }

      if (findCours.activites && findCours.activites.length > 0) {
        for (const activite of findCours.activites) {
          // Supprimer les dépôts associés à l'activité
          if (activite.depot && activite.depot.length > 0) {
            for (const depot of activite.depot) {
              await SoumissionModel.findByIdAndDelete(depot._id);
            }
          }
          // Supprimer l'activité elle-même
          await activiteModel.findByIdAndDelete(activite._id);
        }
      }

      // Étape 4 : Supprimer le cours
      await Cours.findByIdAndDelete(idCours);

      return res.json({
        msg: "Cours et ses données associées supprimés avec succès",
        success: true,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },
};

module.exports = CoursCtrl;
