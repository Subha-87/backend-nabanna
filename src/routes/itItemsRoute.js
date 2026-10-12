const express = require("express");
const router = express.Router();
const path = require("path");
const verifyToken = require("../middleware/auth");

const {
  postItItemsData,
  getItItemsData,
  getSearchItemData,
  updateItemData,
  deleteItemData,
} = require("../controller/itItemController");

router.post("/incoming", verifyToken, postItItemsData);
router.get("/showincoming", verifyToken, getItItemsData);
router.get("/search", verifyToken, getSearchItemData);
router.put("/update/:editId", verifyToken, updateItemData);
router.delete("/delete/:deleteId", verifyToken, deleteItemData);

module.exports = router;
