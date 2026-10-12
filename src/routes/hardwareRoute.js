const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const {
  getAllData,
  createHardwareSetup,
  searchData,
  editSystemStatus,
  deleteHardwareSystem,
  exportAmcSystems,
  searchHardware,
  postRepairData,
  getRepairData,
  editRepairData,
  removeRepairData,
  getAMCData,
  activateAMC,
  getRenewalData,
  renewAMCData,
  getDashboardSummary
} = require("../controller/hardwareController");

// THIS IS USER-MACHINE-DETAILS ROUTES//
router.get("/", verifyToken, getAllData);
router.post("/", verifyToken, createHardwareSetup);
router.get("/search/:search_user", verifyToken, searchData);
router.patch("/update/:edit_id", verifyToken, editSystemStatus);
router.delete("/deleteSystem/:del_id", verifyToken, deleteHardwareSystem);
router.get("/export-amc", verifyToken, exportAmcSystems);
router.get("/search-machine", verifyToken, searchHardware);
router.get("/amc-detail", verifyToken, getAMCData);
router.put("/activate-amc",verifyToken,activateAMC)
router.get("/renewal-details",verifyToken,getRenewalData)
router.put("/activate-renewal",verifyToken,renewAMCData)
router.get("/dashboard-summary",verifyToken,getDashboardSummary)

// THIS IS MACHINE REPAIR ROUTES //
router.post("/repair", verifyToken, postRepairData);
router.get("/get-repair", verifyToken, getRepairData);
router.put("/e-repair/:r_id", verifyToken, editRepairData);
router.delete("/repair/:d_id", verifyToken, removeRepairData);

module.exports = router;
