const router = require("express").Router();
let ActiviteCtrl = require("../controllers/ActiviteCtrl");

let auth = require("../middleware/auth");

router.post("/activite", auth.authEnseignant, ActiviteCtrl.createActivite);
router.get(
  "/ActivitesEnseignant",
  auth.authEnseignant,
  ActiviteCtrl.getActivitesEnseignant
);

router.post("/findcomment", ActiviteCtrl.getCommantaireByActivites);

router.post("/getActivitesById", ActiviteCtrl.getActivitesById);

router.post("/createCommentaire", auth.authEleve, ActiviteCtrl.createComment);
router.post(
  "/repondecommentaire",
  auth.authEnseignant,
  ActiviteCtrl.repondreCommentaire
);

router.post("/deleteActivites", ActiviteCtrl.deleteActivites);
module.exports = router;
