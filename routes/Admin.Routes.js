const router = require("express").Router();
let AdminCtrl = require("../controllers/AdminCtrl");

router.post("/loginAdmin", AdminCtrl.login);

module.exports = router;
