const multer = require("multer");
const path = require("path");

// set director pt salvare fisiere
const tempDir = path.join(__dirname, "../tmp");

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: multerConfig,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
