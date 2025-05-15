const router = require("express").Router();

const EleveCtrl = require("../controllers/EleveCtrl");
let auth = require("../middleware/auth");

router.post("/eleveByclasse", auth.authAdmin, EleveCtrl.getAllEleve);
router.post("/eleve", auth.authAdmin, EleveCtrl.createEleve);
router.post("/loginEleve", EleveCtrl.login);
router.post("/supprimerEleve", EleveCtrl.supprimerEleve);
router.post("/modiferEleve", EleveCtrl.modifierEleve);
module.exports = router;
