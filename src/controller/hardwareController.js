const mongoose = require("mongoose");
const hardwareCollection = require("../models/hardwareModel");
const amcCollection = require("../models/amcMaster");
const amcModel = require("../models/amcMaster");
const systemRepairCollection = require("../models/repairModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { activateAMCForMachines } = require("../services/amcService");
const {dashboardService} = require ("../services/SystemHardware.service")

// Get All Nabanna System Details in warranty/AMC of User Hardware Set Up //

const getAllData = async (req, resp) => {
  //console.log('getting Request..') for test
  try {
    const result = await hardwareCollection
      .find()
      .sort({ _id: -1, createdAt: -1 }); //combine sorting so records with id still show newest created record first:
    if (!result.length) return sendError(resp, 404, "No hardware data found");
    return sendSuccess(resp, 200, "Data Fetched Successfull", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// POST NEW SYSTEM for NABANNA with warranty/AMC
const createHardwareSetup = async (req, res) => {
  try {
    const {
      date,
      department,
      floor,
      room,
      username,
      rank,
      office,
      machineDetails,
      supplier,
      warrantyType,
    } = req.body;

    // Convert date string (DD/MM/YYYY) → JS Date
    //const [day, month, year] = date.split("/");
    //const installationDate = new Date(`${year}-${month}-${day}`);
    // 🔁 Convert array → object
    // 🔥 NORMALIZE SERIAL HERE
    /**machineDetails.forEach((item) => {
      if (item.name === "CPU") {
        // CPU → must be array
        if (!Array.isArray(item.serial)) {
          item.serial = [item.serial];
        }
      } else {
        // Other devices → must be string
        if (Array.isArray(item.serial)) {
          item.serial = item.serial[0];
        }
      }
    });
    const systems = {};

    machineDetails.forEach((item) => {
      const key = item.name.toUpperCase();
      systems[key] = {
        model: item.model,
        make: item.make,
        serial: item.serial,
      };
    });
    // 📅 Handle installation date conditionally
    /** let installationDate = null;

    let amcStatus = "NONE";
    if (warrantyType === "AMC") {
      amcStatus = "REQUIRED";
    }

    if (warrantyType === "WARRANTY" && date) {
      // If date is DD/MM/YYYY
      if (date.includes("/")) {
        const [day, month, year] = date.split("/");
        installationDate = new Date(`${year}-${month}-${day}`);
      } else {
        // If date is YYYY-MM-DD (HTML date input)
        installationDate = new Date(date);
      }
    }**/

    let installDate = null;

    if (date) {
      if (date.includes("/")) {
        const [day, month, year] = date.split("/");
        installDate = new Date(`${year}-${month}-${day}`);
      } else {
        installDate = new Date(date);
      }
    }

    const systems = {};

    machineDetails.forEach((item) => {
      const key = item.name.toUpperCase();

      // CPU serial can be array
      let serial = item.serial;

      if (key === "CPU") {
        if (!Array.isArray(serial)) {
          serial = [serial];
        }
      } else {
        if (Array.isArray(serial)) {
          serial = serial[0];
        }
      }

      let warrantyYears = null;
      if (warrantyType === "WARRANTY") {
        const defaultWarranty = {
          CPU: 3,
          MONITOR: 3,
          LAPTOP: 3,
          ALL_IN_ONE: 3,
          UPS: 1,
        };
        warrantyYears = Number(item.warrantyYears) || defaultWarranty[key];
      }

      systems[key] = {
        model: item.model,
        make: item.make,
        serial,

        installationDate: warrantyType === "WARRANTY" ? installDate : null,

        warrantyYears,

        warrantyType,

        amcStatus: "NONE",
        amcContract: null,
      };
    });

    const payload = {
      employeeName: username,
      designation: rank,
      office,
      roomNo: room,
      department,
      floor,
      supplier,
      systems,
    };

    const result = await hardwareCollection.create(payload);

    return sendSuccess(res, 201, "System is Entered Successfully", result);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal Server Error");
  }
};

// Search Nabanna System Based on User Name //
const searchData = async (req, resp) => {
  //console.log("Requestin..")
  const { search_user } = req.params;
  const employee = search_user?.trim();
  console.log(employee)
  const filter = {
    $or: [
      
      { employeeName: { $regex: employee, $options: "i" } },
      
    ],
  };
  try {
    const searchResult = await hardwareCollection
      .findOne(filter)             // find()--> return multiple document as array , findOne() -> return single doucment //
      .sort({ _id: -1 });
    //console.log(searchResult)
    if (!searchResult) return sendError(resp, 404, "No Systems Found");
   return resp.status(200).json({
      success: true,
      message: "System Found",
      matchedDevice: null,
      matchedValue: employee,
      data: searchResult,
    });
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// UPDATE SYSTEM STATUS for NABANNA //
const editSystemStatus = async (req, resp) => {
  //console.log("requesting ...", req.body);
  try {
    const { edit_id } = req.params;
    const {
      department,
      designation,
      employeeName,
      floor,
      office,
      roomNo,

      systemCondition,
      remarks,
    } = req.body;
    const result = await hardwareCollection.findByIdAndUpdate(
      edit_id,
      {
        department,
        designation,
        employeeName,
        floor,
        office,
        roomNo,

        systemCondition,
        remarks,
      },
      { new: true },
    );
    if (!result) return sendError(resp, 404, "Cant Update");
    return sendSuccess(resp, 200, "Update Successful");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// DELETE SYSTEM FROM ENTIRE HARDWARE DATABASE//
const deleteHardwareSystem = async (req, resp) => {
  try {
    const { del_id } = req.params;
    const result = await hardwareCollection.findByIdAndDelete(del_id);
    if (!result) return sendError(resp, 404, "Nothing to Delete");
    return sendSuccess(resp, 200, "System Deleted Successfully");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// EXPORT AMC LISTED SYSTEM FOR EXCEL PRINT //
const exportAmcSystems = async (req, resp) => {
  //console.log("requesting...amc")
  try {
    const result = await hardwareCollection
      .find({
        amcStatus: { $in: ["REQUIRED", "ON"] }, // have to get amc excel paper ready before amcStatus :"EXPIRED" //
      })
      .lean(); //->lean() method is a powerful tool for improving performance and memory efficiency in your Node.js applications
    //console.log(result.length);
    if (!result.length) return sendSuccess(resp, 404, "No Data Found");
    return sendSuccess(resp, 200, "Data Fetched Successful", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// ** FIND Single NABANNA SYSTEM BASED ON SERIAL NUMBER **//
const searchHardware = async (req, res) => {
  //console.log(req.query);
  try {
    // Get the System (ALL-in-One,CPU/MONITOR,PRINTER,LAPTOP etc) & respictive value(Serial)
    //console.log(req.query)
    const { system, value } = req.query;
    const cleanValue = value?.trim(); // items serial number //

    if (!system || !cleanValue)
      return sendError(res, 400, "System and Search value required");

    const sys = system.toUpperCase();

    const result = await hardwareCollection.findOne({ // use findOne() --> as search result need only one document//
      $or: [
        { [`systems.${sys}.serial`]: cleanValue }, // string match
        { [`systems.${sys}.serial`]: { $elemMatch: { $eq: cleanValue } } }, // array match
      ],
    });
    //console.log(!!result.length)
    //console.log(result);
    if (!result) return sendError(res, 404, "No Such Machine Found in Nabanna");
    //return sendSuccess(res, 200, "System Found", result);
    return res.status(200).json({
      success: true,
      message: "System Found",
      matchedDevice: sys,
      matchedValue: cleanValue,
      data: result,
    });
  } catch (err) {
    //console.log(err)
    return sendError(res, 500, "Internal Server Error");
  }
};

// POST REPAIR DATA FOR CHARGE SECTION //
const postRepairData = async (req, resp) => {
  //console.log("getting request..");
  try {
    const payload = req.body;
    //console.log(payload);
    const result = await systemRepairCollection.create(payload);
    return sendSuccess(resp, 201, "Saved Successfull", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// GET REPAIR DATA IN CHARGE SECTION //
const getRepairData = async (req, resp) => {
  try {
    const result = await systemRepairCollection.find();
    if (!result.length) return sendError(resp, 404, "No Data Found");
    return sendSuccess(resp, 200, "Data Found", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// UPDATE REPAIR STATUS IN CHARGE SECTION //
const editRepairData = async (req, resp) => {
  //console.log(req.body);
  try {
    const { r_id } = req.params;
    const { priceValue, remarks, repairDate, repairPart } = req.body;
    const result = await systemRepairCollection.findByIdAndUpdate(
      r_id,
      { priceValue, remarks, repairDate, repairPart },
      { new: true },
    );
    if (!result) return sendError(resp, 404, "Cant Update");
    return sendSuccess(resp, 200, "Update Successful", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

const removeRepairData = async (req, resp) => {
  try {
    const { d_id } = req.params;
    const result = await systemRepairCollection.findByIdAndDelete(d_id);
    if (!result) return sendError(resp, 404, "Nothing to Delete");
    return sendSuccess(resp, 200, "System Deleted Successfully");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// When Renwal Button Clicked on UI//
const getAMCData = async (req, res) => {
  try {
    const previousContract = await amcCollection.findOne({
      status: "ACTIVE",
    });

    if (!previousContract)
      return sendError(res, 404, "No Active AMC Contract Found");

    // Single device types
    const DEVICE_TYPES = ["CPU", "MONITOR", "ALL_IN_ONE", "LAPTOP", "UPS"];

    let total = 0;

    // Count CPU / Monitor / UPS / Laptop / All-in-One
    for (const device of DEVICE_TYPES) {
      total += await hardwareCollection.countDocuments({
        [`systems.${device}.warrantyType`]: "AMC",
        [`systems.${device}.amcStatus`]: "NONE",
        [`systems.${device}.amcContract`]: null,
      });
    }

    // Count every Printer device
    const printerCount = await hardwareCollection.aggregate([
      { $unwind: "$systems.PRINTER" },
      {
        $match: {
          "systems.PRINTER.warrantyType": "AMC",
          "systems.PRINTER.amcStatus": "NONE",
          "systems.PRINTER.amcContract": null,
        },
      },
      {
        $count: "total",
      },
    ]);

    total += printerCount.length ? printerCount[0].total : 0;

    // Count every Scanner device
    const scannerCount = await hardwareCollection.aggregate([
      { $unwind: "$systems.SCANNER" },
      {
        $match: {
          "systems.SCANNER.warrantyType": "AMC",
          "systems.SCANNER.amcStatus": "NONE",
          "systems.SCANNER.amcContract": null,
        },
      },
      {
        $count: "total",
      },
    ]);

    total += scannerCount.length ? scannerCount[0].total : 0;
    if (total === 0)
      return sendError(res, 404, "No Device Available awaiting for AMC ");

    return sendSuccess(res, 200, "AMC Data", {
      contractName: previousContract.contractName,
      agencyName: previousContract.agencyName,
      workOrderNo: previousContract.workOrderNo,
      contractNo: previousContract.contractNo,

      startDate: previousContract.startDate,
      endDate: previousContract.endDate,

      status: previousContract.status,

      coveredDevices: previousContract.coveredMachines,

      machinesWaiting: total,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal Server Error");
  }
};

const activateAMC = async (req, resp) => {
  try {
    // Find current active AMC contract
    const previousContract = await amcCollection.findOne({
      status: "ACTIVE",
    });

    if (!previousContract)
      return sendError(resp, 404, "No Active AMC Contract Found");

    // Activate waiting devices
    const activatedDevices = await activateAMCForMachines(previousContract._id);
    console.log("total", activatedDevices);

    // Update covered device count
    previousContract.coveredDevices += activatedDevices;

    await amcModel.updateOne(
      { _id: previousContract._id },
      {
        $inc: {
          coveredDevices: activatedDevices,
        },
      },
    );

    return sendSuccess(
      resp,
      200,
      `${activatedDevices} devices activated successfully.`,
      previousContract,
    );
  } catch (error) {
    console.error(error);

    return sendError(resp, 500, "Internal Server Error");
  }
};

// When Renewal Modal Open and activate Renew AMC Button//

const getRenewalData = async (req, res) => {
  try {
    // Current active contract
    const previousContract = await amcCollection
      .findOne()
      .sort({ createdAt: -1 });

    if (!previousContract) return sendError(res, 404, "No AMC Contract Found");

    // Count expired devices (eligible for renewal)
    let eligibleDevices = 0;

    const DEVICE_TYPES = ["CPU", "MONITOR", "ALL_IN_ONE", "LAPTOP", "UPS"];

    // Single devices
    for (const device of DEVICE_TYPES) {
      eligibleDevices += await hardwareCollection.countDocuments({
        [`systems.${device}.warrantyType`]: "AMC",
        [`systems.${device}.amcStatus`]: "EXPIRED",
      });
    }

    // Printers
    const printerCount = await hardwareCollection.aggregate([
      { $unwind: "$systems.PRINTER" },
      {
        $match: {
          "systems.PRINTER.warrantyType": "AMC",
          "systems.PRINTER.amcStatus": "EXPIRED",
        },
      },
      { $count: "total" },
    ]);

    eligibleDevices += printerCount.length ? printerCount[0].total : 0;

    // Scanners
    const scannerCount = await hardwareCollection.aggregate([
      { $unwind: "$systems.SCANNER" },
      {
        $match: {
          "systems.SCANNER.warrantyType": "AMC",
          "systems.SCANNER.amcStatus": "EXPIRED",
        },
      },
      { $count: "total" },
    ]);

    eligibleDevices += scannerCount.length ? scannerCount[0].total : 0;

    // Suggested next contract dates
    const suggestedStartDate = new Date(previousContract.endDate);
    suggestedStartDate.setDate(suggestedStartDate.getDate() + 1);

    const suggestedEndDate = new Date(suggestedStartDate);
    suggestedEndDate.setFullYear(suggestedEndDate.getFullYear() + 1);
    suggestedEndDate.setDate(suggestedEndDate.getDate() - 1);

    return sendSuccess(res, 200, "Renewal Data", {
      previousContract,
      eligibleDevices,

      suggestedStartDate,
      suggestedEndDate,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal Server Error");
  }
};

const renewAMCData = async (req, res) => {
  try {
    const { agencyName, workOrderNo, contractNo, startDate, remarks } =
      req.body;

    if (!agencyName || !workOrderNo || !contractNo || !startDate) {
      return sendError(res, 400, "All fields are required");
    }

    // Find current active contract
    const previousContract = await amcCollection.findOne({
      status: "ACTIVE",
    });

    if (!previousContract) {
      return sendError(res, 404, "No Active AMC Contract Found");
    }

    // Expire previous contract
    previousContract.status = "EXPIRED";
    await previousContract.save();

    // Create new contract
    const newContract = await amcCollection.create({
      contractName: "Nabanna Hardware AMC",
      agencyName,
      workOrderNo,
      contractNo,
      startDate: new Date(startDate),
      durationYears: 1,
      coveredDevices: 0,
      status: "ACTIVE",
      remarks,
    });

    // Next step:
    // const activated = await renewAMCForMachines(newContract._id);
    // newContract.coveredDevices = activated;
    // await newContract.save();

    return sendSuccess(res, 200, "AMC Renewed Successfully", newContract);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal Server Error");
  }
};

const getDashboardSummary = async(req,resp) => {
  try {
    const result = await dashboardService()
    if(!result) return sendError(resp,404,"System Not Found")
    return sendSuccess(resp,200,"System Found",result)  
  } catch (error) {
    console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
}

module.exports = {
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
};
