const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const{getCATVTask,postCATVtask,updateTVTask } = require("../controller/catvController")


router.get("/getTask/:it_person",verifyToken,getCATVTask)
router.post("/postTask",verifyToken,postCATVtask)
router.put("/updateTask/:id",updateTVTask)

module.exports = router
