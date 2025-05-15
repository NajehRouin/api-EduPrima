const bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let AdminModel = require("../models/AdminModel");

let AdminCtrl = {
  login: async (req, res) => {
    try {
      let { email, motDePasse } = req.body;
      let findAdmin = await AdminModel.findOne({ email });
      if (!findAdmin)
        return res.status(400).json({ message: "email incorrect" });

      let compare = await bcrypt.compare(motDePasse, findAdmin.motDePasse);
      if (!compare)
        return res.status(302).json({ message: "mot de passe incorrect" });

      const tokenData = {
        _id: findAdmin._id,
        email: findAdmin.email,
      };

      const token = await jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 60 * 60 * 2,
      });

      const tokenOption = {
        httpOnly: true,
        secure: true,
      };

      res.cookie("token", token, tokenOption).status(200).json({
        message: "login Success",
        Admin: findAdmin,
        data: token,
        success: true,
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: error.message || error, success: false, error: true });
    }
  },
};

module.exports = AdminCtrl;
