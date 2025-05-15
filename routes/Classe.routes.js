const router = require("express").Router();

let ClasseCtrl = require("../controllers/ClassesCtrl");
const { authAdmin, authEnseignant } = require("../middleware/auth");

router.post("/classe", authAdmin, ClasseCtrl.createClasses);
router.post("/getAllclasse", authAdmin, ClasseCtrl.getAllClasse);
router.post("/getAllClasseByEleve", authAdmin, ClasseCtrl.getAllClasseByEleve);
router.post(
  "/getclasseEnseignant",
  authEnseignant,
  ClasseCtrl.getclasseEnseignant
);

router.post("/modifierclasse", authAdmin, ClasseCtrl.modifierclass);

router.post("/deleteClasse", ClasseCtrl.deleteClasse);
module.exports = router;
