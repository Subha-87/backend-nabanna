const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const {
  upload_challan_copy,
  upload_apprv_letter,
  upload_letter,
} = require("./multer");

const {
  getEstimateData,
  postEstimateData,
  uploadApprovalImg,
  updateEstimateData,
  searchEstimate,
  uploadChallan,
  showChallanwithOrder,
  deleteEstimate
} = require("../controller/estimateController");

router.post(
  "/",
  upload_letter.fields([
    { name: "est_copy", maxCount: 1 },
    { name: "req_letter", maxCount: 1 },
  ]),
  postEstimateData,
);
router.get("/", verifyToken, getEstimateData);
router.put(
  "/upload/:editId",
  upload_apprv_letter.single("apprv_copy"),
  uploadApprovalImg,
);
router.put("/update/:editId", verifyToken, updateEstimateData);
router.get("/:s_key", verifyToken, searchEstimate);
//router.patch('/challan',upload_challan_copy.array('challan_img'),uploadChallan)
router.patch(
  "/challan",
  upload_challan_copy.fields([{ name: "challan_img" }, { name: "work_order" }]),
  uploadChallan,
);
router.get("/view/:reqId", verifyToken, showChallanwithOrder);
router.delete("/delete/:del_id",verifyToken,deleteEstimate)
module.exports = router;
