let jwt = require("jsonwebtoken");
let Eleve = require("../models/EleveModel");
let Enseignant = require("../models/EnseignantModel");
let Authentication = {
  authAdmin: async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(200).json({
          message: "Please Login....!",
          error: true,
          success: false,
        });
      }
      jwt.verify(
        token,
        process?.env?.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            console.log("error auth", err);
          }

          req.admin = decoded?._id;
          next();
        }
      );
    } catch (error) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
  },

  authEnseignant: async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(200).json({
          message: "Please Login....!",
          error: true,
          success: false,
        });
      }
      jwt.verify(
        token,
        process?.env?.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            console.log("error auth", err);
          }

          req.enseignant = decoded?._id;
          next();
        }
      );
    } catch (error) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
  },

  authEleve: async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(200).json({
          message: "Please Login....!",
          error: true,
          success: false,
        });
      }
      jwt.verify(
        token,
        process?.env?.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            console.log("error auth", err);
          }

          req.eleve = decoded?._id;
          next();
        }
      );
    } catch (error) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
  },

  authSendMessage: async (req, res, next) => {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .send({ error: "Access denied. No token provided." });

    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (!payload) {
        return res.status(401).send({ error: "Unauthorized. Invalid token." });
      }

      // Détection et chargement de l'utilisateur ou de l'admin
      if (payload.eleveId) {
        const eleve = await Eleve.findById(payload.eleveId).select("-password");
        if (!eleve) return res.status(401).send({ error: "User not found" });

        req.eleve = {
          _id: eleve._id,
        };
      } else if (payload.enseignantId) {
        const enseignant = await Enseignant.findById(
          payload.enseignantId
        ).select("-password");
        if (!enseignant)
          return res.status(401).send({ error: "Admin not found" });

        req.enseignant = {
          _id: enseignant._id,
        };
      } else {
        return res.status(401).send({ error: "Invalid token payload" });
      }

      next();
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Invalid token." });
    }
  },
};

module.exports = Authentication;
