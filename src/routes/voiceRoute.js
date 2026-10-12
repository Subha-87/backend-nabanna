const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const {
  getVoiceData,
  postVoiceData,
  updateVoiceData,
  editDatafromJE,
} = require("../controller/voiceController");
//const{authenticateToken} = require('../Authentication/token')

router.get("/allVoiceData/:it_person", verifyToken, getVoiceData);
router.post("/setTask", verifyToken, postVoiceData);
router.put("/editVoice/:editId", verifyToken, updateVoiceData);
router.put("/reAssign/:e_id", verifyToken, editDatafromJE);

//router.get('/voice',authenticateToken, getVoiceData);
//router.get('/voice/:id',authenticateToken,getSingleVoiceData);
//router.post('/setTask',authenticateToken,postVoiceData);

//router.delete('/voice/:id',authenticateToken, deleteVoiceData);
//router.get('/voice/search-data/:serachKey',authenticateToken,searchData);
//router.get('/filter',authenticateToken,getVoiceDatabyDate)

module.exports = router;
