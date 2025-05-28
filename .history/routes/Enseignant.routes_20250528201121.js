const router = require("express").Router();

const EnseignantCtrl = require("../controllers/EnseignantCtrl");
const { authAdmin, authEnseignant, authEleve } = require("../middleware/auth");

router.post("/enseignant", authAdmin, EnseignantCtrl.AjouterEnseignant);
router.post("/Allenseignant", authAdmin, EnseignantCtrl.getAllEnseignant);
router.post("/loginEns", EnseignantCtrl.login);
router.post("/getEnseignantById", EnseignantCtrl.getEnseignantById);
router.get(
  "/currentEnseignant",
  authEnseignant,
  EnseignantCtrl.currentEnseignant
);

router.get(
  "/getEnseignantsiedBar",
  authEleve,
  EnseignantCtrl.getEnseignantSeidBar
);
router.put("/updateEnseignant", EnseignantCtrl.updateEnseignant);
module.exports = router;
