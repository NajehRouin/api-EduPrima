const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http"); // 🧠 Nécessaire pour socket.io
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");

const bcrypt = require("bcrypt");
const cron = require("node-cron");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // adapte ici aussi
    credentials: true,
  },
});

//  Export pour l'utiliser dans d'autres fichiers
module.exports.io = io;
// Stocker les sockets des utilisateurs connectés
const connectedUsers = new Map();
module.exports.connectedUsers = connectedUsers;

const userSocketMap = {}; // Stocke la map entre l'utilisateur et son socketId

module.exports.getReceiverSocketId = (receiverId, receiverModel) => {
  return userSocketMap[`${receiverModel}:${receiverId}`];
};
// io.on("connection", (socket) => {
//   const userId = socket.handshake.query.userId;
//   const userModel = socket.handshake.query.userModel;

//   if (userId && userModel) {
//     const key = `${userModel}:${userId}`;
//     userSocketMap[key] = socket.id;
//     console.log("connected:", key, socket.id);
//     io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Met à jour la liste des utilisateurs en ligne
//   }

//   socket.on("disconnect", () => {
//     const key = `${userModel}:${userId}`;
//     delete userSocketMap[key];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Met à jour la liste des utilisateurs en ligne
//   });
// });

// //  Gérer la connexion socket
// io.on("connection", (socket) => {
//   console.log(" Nouveau client connecté", socket.id);

//   socket.on("registerUser", (userId) => {
//     connectedUsers.set(userId, socket.id);
//     console.log(`✅ Utilisateur ${userId} enregistré avec socket ${socket.id}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Client déconnecté", socket.id);
//     for (let [userId, socketId] of connectedUsers.entries()) {
//       if (socketId === socket.id) {
//         connectedUsers.delete(userId);
//         break;
//       }
//     }
//   });
// });

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  const userModel = socket.handshake.query.userModel;

  // Partie userModel:userId
  if (userId && userModel) {
    const key = `${userModel}:${userId}`;
    userSocketMap[key] = socket.id;
    console.log("connected:", key, socket.id);
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Met à jour la liste des utilisateurs en ligne
  }

  // Partie registerUser classique
  socket.on("registerUser", (userId) => {
    connectedUsers.set(userId, socket.id);
    // console.log(` Utilisateur ${userId} enregistré avec socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(" Client déconnecté :", socket.id);

    // Supprimer dans userSocketMap
    const key = `${userModel}:${userId}`;
    delete userSocketMap[key];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Supprimer dans connectedUsers
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

app.use(express.json());

app.use(cookieParser());
app.use(bodyParser.json({ strict: false }));
app.use(
  cors({
    origin: process.env.url_front,
    credentials: true,
  })
);

app.use("/resource", express.static("resource"));
app.use("/soumission", express.static("soumission"));

const AdminModel = require("./models/AdminModel");

const EnseignantRouter = require("./routes/Enseignant.routes");
const EleveRouter = require("./routes/Eleve.routes");
const ClasseRouter = require("./routes/Classe.routes");
const CoursRoutes = require("./routes/Cours.routes");
const ActiviteRoutes = require("./routes/Activite.routes");
const SoumissionRoutes = require("./routes/Soumission.Routes");
const AdminRoutes = require("./routes/Admin.Routes");
const NotificationRouter = require("./routes/Notification.routes");
const updateActivitesEtat = require("./config/cron");
const messageRouter = require("./routes/message.routes");
app.use("/api", [
  AdminRoutes,
  EnseignantRouter,
  EleveRouter,
  ClasseRouter,
  CoursRoutes,
  ActiviteRoutes,
  SoumissionRoutes,
  NotificationRouter,
  messageRouter,
]);

//create admin if not exist

const createAdmin = async () => {
  let findAdmin = await AdminModel.findOne();
  if (!findAdmin) {
    let passe = "admin@123@";
    let passwordHash = await bcrypt.hash(passe, 10);
    await AdminModel.createAdmin({
      nom: "admin",
      email: "admin@gmail.com",
      motDePasse: passwordHash,
    });
  }
};

connectDB();
createAdmin();

// si heure == 00:00 lance cron
cron.schedule("0 0 * * *", async () => {
  console.log(" Cron job lancé...");
  await updateActivitesEtat();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
module.exports = {
  app,

  server,
};
