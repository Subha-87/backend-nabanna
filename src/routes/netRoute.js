const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const {
  postTaskDataforNet,
  getTaskDataforNet,
  getSingleTaskDataforUpdate,
  postUpdatateData,
  editDatafromJE,
} = require("../controller/netController");
//const{authenticateToken} = require('../Authentication/token')

router.post("/netTask", verifyToken, postTaskDataforNet); // post direct by JE/AE or via Partha
router.get("/showNetTask/:it_person", verifyToken, getTaskDataforNet);
router.get("/showSingleNetTask/:id", verifyToken, getSingleTaskDataforUpdate);
router.put("/updateNetTask/:id", verifyToken, postUpdatateData); // Update self or pass to other it personnel //
router.put("/netTask/:e_id", verifyToken, editDatafromJE); // Reassign Task to It Personell By JE

module.exports = router;
