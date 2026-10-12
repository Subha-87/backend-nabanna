const Hardware = require("../models/hardwareModel");

// Activate all waiting AMC devices
const activateAMCForMachines = async (contractId) => {
  //console.log(contractId);
  let totalActivated = 0;

  const DEVICE_TYPES = ["CPU", "MONITOR", "ALL_IN_ONE", "LAPTOP", "UPS"];

  // -------------------------
  // Single device types
  // -------------------------
  for (const device of DEVICE_TYPES) {
    const result = await Hardware.updateMany(
      {
        [`systems.${device}.warrantyType`]: "AMC",
        [`systems.${device}.amcStatus`]: "NONE",
        [`systems.${device}.amcContract`]: null,
      },
      {
        $set: {
          [`systems.${device}.amcStatus`]: "ON",
          [`systems.${device}.amcContract`]: contractId,
        },
      },
    );

    totalActivated += result.modifiedCount;
  }
  //console.log("main Device:", totalActivated);

  // -------------------------
  // Printer Array
  // -------------------------
  const printerResult = await Hardware.updateMany(
    {
      "systems.PRINTER": {
        $elemMatch: {
          warrantyType: "AMC",
          amcStatus: "NONE",
          amcContract: null,
        },
      },
    },
    {
      $set: {
        "systems.PRINTER.$[item].amcStatus": "ON",
        "systems.PRINTER.$[item].amcContract": contractId,
      },
    },
    {
      arrayFilters: [
        {
          "item.warrantyType": "AMC",
          "item.amcStatus": "NONE",
          "item.amcContract": null,
        },
      ],
    },
  );

  //console.log(printerResult.matchedCount);
  //console.log(printerResult.modifiedCount);

  totalActivated += printerResult.modifiedCount;

  // -------------------------
  // Scanner Array
  // -------------------------
  const scannerResult = await Hardware.updateMany(
    {
      "systems.SCANNER": {
        $elemMatch: {
          warrantyType: "AMC",
          amcStatus: "NONE",
          amcContract: null,
        },
      },
    },
    {
      $set: {
        "systems.SCANNER.$[item].amcStatus": "ON",
        "systems.SCANNER.$[item].amcContract": contractId,
      },
    },
    {
      arrayFilters: [
        {
          "item.warrantyType": "AMC",
          "item.amcStatus": "NONE",
          "item.amcContract": null,
        },
      ],
    },
  );
  //console.log(scannerResult.matchedCount);
  //console.log(scannerResult.modifiedCount);
  totalActivated += scannerResult.modifiedCount;

  return totalActivated;
};

module.exports = {
  activateAMCForMachines,
};
