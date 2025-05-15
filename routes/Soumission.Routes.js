const router = require("express").Router();
let auth = require("../middleware/auth");
const upload = require("../middleware/uploadSoumission");

let SoumissionCtrl = require("../controllers/SoumissionCtrl");

router.post(
  "/soumission",
  auth.authEleve,
  upload.single("fichier"),
  SoumissionCtrl.createDepot
);

router.post(
  "/modifiersoumission",
  auth.authEleve,
  upload.single("fichier"),
  SoumissionCtrl.modifierDepot
);
router.post("/note", auth.authEnseignant, SoumissionCtrl.AjouterNote);

router.post("/getDepotByEleve", auth.authEleve, SoumissionCtrl.getDepotByEleve);

router.post("/getAllDepot", SoumissionCtrl.getAllDepot);
module.exports = router;
