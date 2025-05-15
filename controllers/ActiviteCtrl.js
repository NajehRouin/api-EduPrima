const Activite = require("../models/activiteModel");
const Cours = require("../models/CoursModel");
const Enseignant = require("../models/EnseignantModel");
const Notification = require("../models/NotificationModel");

const { io, connectedUsers } = require("../index");
const EleveModel = require("../models/EleveModel");
const { default: mongoose } = require("mongoose");
const EnseignantModel = require("../models/EnseignantModel");
const SoumissionModel = require("../models/SoumissionModel");
let ActiviteCtrl = {
  createActivite: async (req, res) => {
    try {
      let { titre, description, dateLimite, idCours } = req.body;

      let findEnseignant = await Enseignant.findById({ _id: req.enseignant });

      if (!findEnseignant)
        return res.status(500).json({ error: "Veuillez vous connecter....!" });
      let newActivite = new Activite({
        titre,
        description,
        dateLimite: new Date(dateLimite),
        idCours,
      });
      await newActivite.save();

      const cours = await Cours.findById(idCours);
      const classeId = cours.classe;

      // 🔸 Récupérer tous les élèves de cette classe
      const eleves = await EleveModel.find({ classe: classeId });

      for (let eleve of eleves) {
        const eleveId = eleve._id.toString();
        const socketId = connectedUsers.get(eleveId);

        if (socketId) {
          const message = `Nouvelle activité: ${titre} dans le cours ${cours?.titre}`;

          // 1. (Optionnel) Stocker la notification en base
          await Notification.create({
            userId: eleveId,
            message,
          });

          // 2. Envoyer en temps réel uniquement si l'élève est connecté ET fait partie de la classe
          io.to(socketId).emit("newNotification", {
            message,
            date: new Date(),
          });
        }
      }

      //recherche le cours by id pour push id activite dans cours

      let updatedCours = await Cours.findByIdAndUpdate(
        idCours,
        { $push: { activites: newActivite._id } },
        { new: true } // retourne le document mis à jour
      );
      res.status(201).json({
        message: "Activite  créés avec succès",
        activite: newActivite,
        success: true,
        error: false,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: error.message, success: false, error: true });
    }
  },

  getActivitesEnseignant: async (req, res) => {
    try {
      let findEnseignant = await Enseignant.findById({ _id: req.enseignant });

      if (!findEnseignant)
        return res.status(500).json({ error: "Veuillez vous connecter....!" });

      // Récupérer les cours de l'enseignant

      let findCours = await Cours.find({
        enseignantId: req.enseignant,
      }).populate({
        path: "activites",
        populate: {
          path: "depot",
          populate: {
            path: "idEleve",
          },
        },
      });

      // Extraire toutes les activités depuis chaque cours
      let allActivites = [];

      findCours.forEach((cours) => {
        if (cours.activites && Array.isArray(cours.activites)) {
          allActivites = allActivites.concat(cours.activites);
        }
      });

      res.status(200).json({
        result: allActivites,
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message, success: false, error: true });
    }
  },

  getActivitesById: async (req, res) => {
    try {
      const { idActivite } = req.body;

      let findActivite = await Activite.findById({ _id: idActivite })
        .populate({
          path: "depot",
          populate: {
            path: "idEleve",
            select: "-motDePasse -role -__v -classe",
          },
        })
        .select("-commentaire");

      let findCours = await Cours.findById({ _id: findActivite.idCours });

      let findEleve = await EleveModel.find({ classe: findCours.classe });
      let nombreDepot = findActivite.depot.length + "/" + findEleve.length;

      res.status(200).json({ result: findActivite, nombreDepot: nombreDepot });
    } catch (error) {}
  },

  getCommantaireByActivites: async (req, res) => {
    try {
      let { idActivite } = req.body;
      let findActivite = await Activite.findById({ _id: idActivite });

      res.status(200).json({ result: findActivite });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createComment: async (req, res) => {
    try {
      let findEleve = await EleveModel.findById({ _id: req.eleve });

      if (!findEleve)
        return res.status(500).json({ error: "Veuillez vous connecter....!" });

      let { commentaire, id } = req.body;
      let updatedActivite = await Activite.findByIdAndUpdate(
        id,
        {
          $push: {
            commentaire: {
              _id: new mongoose.Types.ObjectId(),
              eleve: findEleve?.nom,
              commentaire: commentaire,
              datecomment: new Date(),
            },
          },
        },
        { new: true } // retourne le document mis à jour
      );

      res.status(201).json({
        message: "Votre commentaire a été envoyé avec succès.",
        commentaire: commentaire,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  repondreCommentaire: async (req, res) => {
    try {
      // Vérifier que l'enseignant est connecté
      const findEnseignant = await EnseignantModel.findById({
        _id: req.enseignant,
      });
      if (!findEnseignant)
        return res
          .status(401)
          .json({ error: "Veuillez vous connecter en tant qu'enseignant." });

      const { idActivite, idCommentaire, reponse } = req.body;

      // Récupérer l'activité
      const activite = await Activite.findById({ _id: idActivite });
      if (!activite)
        return res.status(404).json({ error: "Activité non trouvée." });
      let commentaireTrouve = null;

      for (let i = 0; i < activite.commentaire.length; i++) {
        if (activite.commentaire[i]?._id.toString() === idCommentaire) {
          // Ajouter la réponse
          activite.commentaire[i].reponse = reponse;
          (activite.commentaire[i].Enseignant = findEnseignant.nom),
            (activite.commentaire[i].datereponse = new Date()),
            (commentaireTrouve = activite.commentaire[i]);
          break;
        }
      }

      if (!commentaireTrouve) {
        return res.status(404).json({ error: "Commentaire non trouvé." });
      }

      // Marquer le champ comme modifié pour que Mongoose le prenne en compte
      activite.markModified("commentaire");
      await activite.save();

      res.status(200).json({
        message: "Réponse envoyée avec succès.",
        reponse: commentaireTrouve,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteActivites: async (req, res) => {
    try {
      let { idActivite } = req.body;

      // 1. Trouver l'activité
      let findActivite = await Activite.findById(idActivite).populate("depot");

      if (!findActivite) {
        return res.status(404).json({ error: "Activité non trouvée" });
      }

      // 2. Vérifier s'il y a des dépôts
      if (findActivite.depot && findActivite.depot.length > 0) {
        const idsDepots = findActivite.depot.map((d) => d._id);
        console.log("idsDepots", idsDepots);
        // 3. Supprimer les dépôts
        await SoumissionModel.deleteMany({ _id: { $in: idsDepots } });
      }

      // 4. Supprimer l’activité
      await Activite.findByIdAndDelete(idActivite);

      res.json({ message: "Activité et ses dépôts supprimés avec succès" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = ActiviteCtrl;
