const EleveModel = require("../models/EleveModel");
let Notification = require("../models/NotificationModel");

let NotificationCtrl = {
  getNoficationEleve: async (req, res) => {
    try {
      let findEleve = await EleveModel.findById({ _id: req.eleve });
      if (!findEleve)
        return res.status(500).json({ error: "Veuillez vous connecter....!" });
      let findNotifications = await Notification.find({
        userId: findEleve?._id,
      }).sort({ createdAt: -1 });
      res.json(findNotifications);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des notifications." });
    }
  },
};

module.exports = NotificationCtrl;
