const hardwareCollection = require("../models/hardwareModel");

const dashboardService = async () => {
  try {
    const result = await hardwareCollection.aggregate([
      // -----------------------------------------
      // Convert systems object into key/value pairs
      // -----------------------------------------
      {
        $project: {
          devices: {
            $objectToArray: "$systems",
          },
        },
      },

      // -----------------------------------------
      // One entry for CPU, MONITOR, PRINTER etc.
      // -----------------------------------------
      {
        $unwind: "$devices",
      },

      // -----------------------------------------
      // Convert single devices to arrays
      // PRINTER / SCANNER are already arrays
      // -----------------------------------------
      {
        $project: {
          deviceType: "$devices.k",

          deviceList: {
            $cond: [{ $isArray: "$devices.v" }, "$devices.v", ["$devices.v"]],
          },
        },
      },

      // -----------------------------------------
      // One document per physical device
      // -----------------------------------------
      {
        $unwind: "$deviceList",
      },

      // Remove empty/null devices
      {
        $match: {
          deviceList: { $ne: null },
        },
      },

      // -----------------------------------------
      // Calculate dashboard counts
      // -----------------------------------------
      {
        $group: {
          _id: null,

          // Total hardware devices
          totalSystems: {
            $sum: 1,
          },

          // Device type counts
          cpu: {
            $sum: {
              $cond: [{ $eq: ["$deviceType", "CPU"] }, 1, 0],
            },
          },

          monitor: {
            $sum: {
              $cond: [{ $eq: ["$deviceType", "MONITOR"] }, 1, 0],
            },
          },

          allInOne: {
            $sum: {
              $cond: [{ $eq: ["$deviceType", "ALL_IN_ONE"] }, 1, 0],
            },
          },

          laptop: {
            $sum: {
              $cond: [{ $eq: ["$deviceType", "LAPTOP"] }, 1, 0],
            },
          },

          ups: {
            $sum: {
              $cond: [{ $eq: ["$deviceType", "UPS"] }, 1, 0],
            },
          },

          printer: {
            $sum: {
              $cond: [{ $eq: ["$deviceType", "PRINTER"] }, 1, 0],
            },
          },

          scanner: {
            $sum: {
              $cond: [{ $eq: ["$deviceType", "SCANNER"] }, 1, 0],
            },
          },

          // -----------------------------------------
          // AMC STATUS
          // -----------------------------------------

          amcCovered: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$deviceList.warrantyType", "AMC"],
                    },
                    {
                      $eq: ["$deviceList.amcStatus", "ON"],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          amcRequired: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$deviceList.warrantyType", "AMC"],
                    },
                    {
                      $eq: ["$deviceList.amcStatus", "REQUIRED"],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          amcExpired: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$deviceList.warrantyType", "AMC"],
                    },
                    {
                      $eq: ["$deviceList.amcStatus", "EXPIRED"],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          // -----------------------------------------
          // WARRANTY
          // -----------------------------------------

          underWarranty: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$deviceList.warrantyType", "WARRANTY"],
                    },
                    {
                      $ne: ["$deviceList.installationDate", null],
                    },
                    {
                      $gt: [
                        {
                          $dateAdd: {
                            startDate: "$deviceList.installationDate",
                            unit: "year",
                            amount: "$deviceList.warrantyYears",
                          },
                        },
                        "$$NOW",
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          // Count Of Printers//
          printerHP: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$deviceType", "PRINTER"] },
                    {
                      $regexMatch: {
                        input: { $ifNull: ["$deviceList.make", ""] },
                        regex: "^HP$",
                        options: "i", //makes the comparison case-insensitive, so HP, Hp, and hp all count as HP.
                      },
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          printerCanon: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$deviceType", "PRINTER"] },
                    {
                      $regexMatch: {
                        input: { $ifNull: ["$deviceList.make", ""] },
                        regex: "^CANON$",
                        options: "i",
                      },
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          printerBrother: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$deviceType", "PRINTER"] },
                    {
                      $regexMatch: {
                        input: { $ifNull: ["$deviceList.make", ""] },
                        regex: "^BROTHER$",
                        options: "i",
                      },
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          printerOthers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$deviceType", "PRINTER"] },
                    {
                      $not: {
                        $regexMatch: {
                          input: { $ifNull: ["$deviceList.make", ""] },
                          regex: "^(HP|CANON|BROTHER)$",
                          options: "i",
                        },
                      },
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      // -----------------------------------------
      // Remove _id from final result
      // -----------------------------------------
      {
        $project: {
          _id: 0,
          totalSystems: 1,

          cpu: 1,
          monitor: 1,
          allInOne: 1,
          laptop: 1,
          ups: 1,
          printer: 1,
          scanner: 1,

          underWarranty: 1,
          amcCovered: 1,
          amcRequired: 1,
          amcExpired: 1,

          printerHP: 1,
          printerCanon: 1,
          printerBrother: 1,
          printerOthers: 1,
        },
      },
    ]);

    // No hardware records
    if (!result.length) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error("Dashboard Service Error:", error);
    throw new Error(error.message);
  }
};

module.exports = {
  dashboardService,
};
