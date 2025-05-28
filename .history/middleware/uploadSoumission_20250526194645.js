const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the destination folder
const destinationFolder = "soumission/";

// Ensure the destination folder exists
if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadSoumission = multer({ storage });

module.exports = uploadSoumission;
