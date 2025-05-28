let router = require("express").Router();
let specialiteCtrl = require("../controllers/SpecialiteCtrl");

router.get("/specialite", specialiteCtrl.getAllSpecialite);

router.post("/specialite", specialiteCtrl.AjouterSpecilate);
router.post("/modifierSpecilaite", specialiteCtrl.modifierSpecialite);

module.exports = router;
