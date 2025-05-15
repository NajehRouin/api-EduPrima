let router = require("express").Router();

let NotificationCtrl = require("../controllers/NotificationCtrl");
const { authEleve } = require("../middleware/auth");

router.get("/notification", authEleve, NotificationCtrl.getNoficationEleve);

module.exports = router;
