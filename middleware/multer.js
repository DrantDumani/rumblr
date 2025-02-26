const multer = require('multer');

exports.uploadImgPost = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2097152, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^image/)) {
      cb(null, true);
    } else cb(null, false);
  },
});

exports.uploadAudioPost = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2097152, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^audio/)) {
      cb(null, true);
    } else cb(null, false);
  },
});

exports.uploadVideoPost = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2097152, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^video/)) {
      cb(null, true);
    } else cb(null, false);
  },
});

exports.uploadUserProfile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2097152, files: 2 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^image/)) {
      cb(null, true);
    } else cb(null, false);
  },
});

exports.upload = multer({});
