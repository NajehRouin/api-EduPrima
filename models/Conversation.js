let mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        participantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        participantModel: {
          type: String,
          enum: ["Eleve", "Enseignant"],
          required: true,
        },
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
