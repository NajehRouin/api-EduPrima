const Conversation = require("../models/Conversation");
const Message = require("../models/Messages");
const { io, getReceiverSocketId } = require("../index");
const EleveModel = require("../models/EleveModel");
const EnseignantModel = require("../models/EnseignantModel");

exports.sendMessage = async (req, res) => {
  const { receiverId, receiverModel, message } = req.body;

  const isEleve = !!req.eleve;
  const senderId = isEleve ? req.eleve?._id : req.enseignant?._id;
  const senderModel = isEleve ? "Eleve" : "Enseignant";

  if (!message || !receiverId || !receiverModel) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    let conversation;
    conversation = await Conversation.findOne({
      participants: {
        $all: [
          {
            $elemMatch: {
              participantId: senderId,
              participantModel: senderModel,
            },
          },
          {
            $elemMatch: {
              participantId: receiverId,
              participantModel: receiverModel,
            },
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { participantId: senderId, participantModel: senderModel },
          { participantId: receiverId, participantModel: receiverModel },
        ],
      });
    }

    const newMessage = await Message.create({
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      message,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    // Envoie le message à l'utilisateur via le socket, si l'utilisateur est en ligne
    const receiverSocketId = getReceiverSocketId(receiverId, receiverModel);
    console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrrr", receiverSocketId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConversationByEnseignant = async (req, res) => {
  try {
    const findEleve = await EleveModel.findById(req.eleve);

    if (!findEleve)
      return res.status(500).json({ error: "Veuillez vous connecter....!" });
    let { idEnseignant } = req.body;
    const conversations = await Conversation.findOne({
      participants: {
        $all: [
          {
            $elemMatch: {
              participantId: findEleve?._id,
              participantModel: "Eleve",
            },
          },
          {
            $elemMatch: {
              participantId: idEnseignant,
              participantModel: "Enseignant",
            },
          },
        ],
      },
    }).populate("messages");

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

exports.getConversationByEleve = async (req, res) => {
  try {
    let findEnseignant = await EnseignantModel.findById({
      _id: req.enseignant,
    });
    if (!findEnseignant)
      return res.status(500).json({ error: "Veuillez vous connecter....!" });
    let { idEleve } = req.body;
    const conversations = await Conversation.findOne({
      participants: {
        $all: [
          {
            $elemMatch: {
              participantId: idEleve,
              participantModel: "Eleve",
            },
          },
          {
            $elemMatch: {
              participantId: findEnseignant?._id,
              participantModel: "Enseignant",
            },
          },
        ],
      },
    }).populate("messages");
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};
