const express = require("express");

const {
  getMeetingData,
  postMeetingData,
  editMeeting,
  deleteMeeting,
  searchMeeting
} = require("../controller/meetingController");
const { letterUpload } = require("./multer");
const router = express.Router();

router.get("/fetchAll", getMeetingData);
router.post("/register", letterUpload.single("letter"), postMeetingData);
router.put('/update/:edit_id',letterUpload.single("letter"),editMeeting);
router.delete('/delete/:del_id',deleteMeeting)
router.get("/search",searchMeeting)

module.exports = router;
