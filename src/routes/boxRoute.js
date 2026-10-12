const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { addUserBox, getAllBox,editBoxInfo,deleteBox,searchBoxDetails } = require("../controller/boxController");

router.post("/registerBox", verifyToken, addUserBox);
router.get("/showAll", verifyToken, getAllBox);
router.put("/editBox/:edit_id",verifyToken,editBoxInfo)
router.delete("/removeBox/:del_id",verifyToken,deleteBox)
router.get("/searchBox/",verifyToken,searchBoxDetails)

module.exports = router;
