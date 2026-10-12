const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },

    make: {
      type: String,
      required: true,
    },

    serial: {
      type: mongoose.Schema.Types.Mixed, // String or Array
      required: true,
    },

    installationDate: {
      type: Date,
      required: () => {
        return this.warrantyType === "WARRANTY";
      }, // return boolean, true or false
    },

    warrantyType: {
      type: String,
      enum: ["WARRANTY", "AMC"],
    },

    warrantyYears: {
      type: Number,
      required: function () {
        return this.warrantyType === "WARRANTY";
      },
      default: null,
    },

    amcStatus: {
      type: String,
      enum: ["NONE", "REQUIRED", "ON", "EXPIRED"],
      default: "NONE",
    },
    amcContract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AmcMaster", // ref : collection name
      default: null,
    },
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

deviceSchema.virtual("remainingWarranty").get(function () {
  if (!this.installationDate) {
    return "Expired";
  }

  const today = new Date();

  const endDate = new Date(this.installationDate);

  endDate.setFullYear(endDate.getFullYear() + this.warrantyYears);

  if (endDate <= today) {
    return "Expired";
  }

  const diff = endDate - today;

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const years = Math.floor(days / 365);

  const months = Math.floor((days % 365) / 30);

  return `${years}y ${months}m`;
});

const hardwareSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      trim: true,
    },

    employeeName: {
      type: String,
      default: "-",
      trim: true,
    },

    designation: {
      type: String,
      default: "-",
      trim: true,
    },

    roomNo: {
      type: String,
      default: "-",
      trim: true,
    },

    floor: {
      type: String,
      trim: true,
    },

    office: {
      type: String,
      trim: true,
    },

    supplier: {
      type: String,
      default: "-",
    },

    systemCondition: {
      type: String,
      enum: ["GOOD", "AVERAGE", "BAD"],
      default: "GOOD",
    },

    systems: {
      ALL_IN_ONE: deviceSchema,

      CPU: deviceSchema,

      MONITOR: deviceSchema,

      UPS: deviceSchema,

      LAPTOP: deviceSchema,

      PRINTER: [deviceSchema],

      SCANNER: [deviceSchema],
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

module.exports = mongoose.model("Hardware", hardwareSchema);
