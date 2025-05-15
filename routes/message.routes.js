const router = require("express").Router();

let messageCtrl = require("../controllers/MessageCtrl");
const {
  authSendMessage,
  authEleve,
  authEnseignant,
} = require("../middleware/auth");

router.post("/conversation/send", authSendMessage, messageCtrl.sendMessage);

router.post(
  "/getConversationByEnseignant",
  authEleve,
  messageCtrl.getConversationByEnseignant
);

router.post(
  "/getConversationByEleve",
  authEnseignant,
  messageCtrl.getConversationByEleve
);
module.exports = router;
