const router = require("express").Router();

let CoursCtrl = require("../controllers/CoursCtrl");
let auth = require("../middleware/auth");

const upload = require("../middleware/upload");

const Resource = require("../models/resourceModel");
const Cours = require("../models/CoursModel");

//router.post("/cours", auth.authEnseignant, CoursCtrl.createCours);
//create cours et Resource

router.post(
  "/cours",
  auth.authEnseignant,
  upload.single("fichier"),
  async (req, res) => {
    try {
      const { titre, description, classeId } = req.body;

      const fichier = req.file;

      if (!fichier) {
        return res.status(400).json({ msg: "Aucun fichier n'a été envoyé." });
      }

      // Étape 1 : Créer la ressource avec le chemin local
      const resource = new Resource({
        nomFichier: fichier.filename,

        lienUrl: `http://localhost:${process?.env?.PORT}/resource/${fichier?.filename}`,
      });

      const savedResource = await resource.save();

      // Étape 2 : Créer le cours
      const cours = new Cours({
        enseignantId: req.enseignant,
        titre,
        description,
        dateCreation: new Date(),
        classe: classeId,
        resource: savedResource._id,
      });

      const savedCours = await cours.save();

      res.status(201).json({
        message: "Cours et ressource créés avec succès",
        cours: savedCours,
        success: true,
        error: false,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        msg: error.message,
        success: false,
        error: true,
      });
    }
  }
);

router.post(
  "/coursbyEnseignant",
  auth.authEnseignant,
  CoursCtrl.getCoursEnseignant
);

router.post("/getactivites", CoursCtrl.getActivitesbyCours);

router.post("/coursByEleve", auth.authEleve, CoursCtrl.listOfCoursByEleve);

module.exports = router;
