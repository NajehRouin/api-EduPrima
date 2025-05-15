const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "soumission/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadSoumission = multer({ storage });

module.exports = uploadSoumission;
