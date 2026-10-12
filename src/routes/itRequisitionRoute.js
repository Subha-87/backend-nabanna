const express = require("express");
//const cors = require('cors');
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/auth");

//const { postITletter, getITletter, getLetterImg, getSingleLetterInfo, postUpdateLetterInfo, delelteItLetter, searchLetter, postUpdatefrom106 } = require('../controller/letterController')
const {
  postITletter,
  getITletter,
  getLetterImg,
  postUpdateLetterInfo,
  postUpdatefrom106,
  searchLetter,
  delelteItLetter,
  updateLetterfromJE,
  solvedITLetter
} = require("../controller/letterController");
const path = require("path");

// Set Path For File Storage //
const uploadDir = path.join(__dirname, "../LetterUpload");

// Set up Storage for uploaded files
const set_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname,
    );
    // or -->cb(null, Date.now() + '-' + file.originalname);
  },
});

//Validating File Types:  1
const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    //cb(null, false);
    cb(new Error("Invalid file type"));
  }
};

// File validation 2
/*const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word docs are allowed'), false);
  }
};*/

// Create the multer instance
const upload_letter = multer({
  storage: set_storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  filefilter: filefilter,
});

router.post(
  "/sendReq",
  upload_letter.single("letter"),
  verifyToken,
  postITletter,
); //for sending formdata use multer//
router.get("/allITData", verifyToken, getITletter);
router.get("/letter_pic/:id",getLetterImg); // getting image router for frontend letter show // not axios call//
router.put("/letterItpersonUpdate/:taskId", verifyToken, postUpdateLetterInfo); // task re-assign
router.put("/letterUpdatefrom105/:e_id", verifyToken, postUpdatefrom106);
router.put("/editRemarks/:edit_id", verifyToken, updateLetterfromJE);
router.get("/searchITletter/:search_key", verifyToken, searchLetter);
router.delete("/delete/:del_id", verifyToken, delelteItLetter);
router.get("/solvedLetter/:it_domain",solvedITLetter)


module.exports = router;

//router.post('/letter', upload_letter.single('letter'), postITletter)

//router.get('/letter/:id', getSingleLetterInfo)
//router.put('/letterUpdate/:id', postUpdateLetterInfo)

//router.put('/letterUpdatefrom105', postUpdatefrom106)
//router.delete('/delITletter/:id', delelteItLetter)
//router.get('/searchITletter/:search_key', searchLetter)

//module.exports = router;
