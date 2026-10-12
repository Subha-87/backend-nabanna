const { Schema, model, default: mongoose } = require("mongoose");

const repairSchema = new Schema(
  {
    date: { type: Date, required: true },
    username: { type: String, required: true },
    department: { type: String, required: true },
    room: { type: String, required: true },
    complain: { type: String }, //required: true },
    repairDate: { type: Date }, //required: true },

    repairPart: { type: String },
    priceValue: {
      type: Number, // store only number like 1250
      //required: true,
    },
    remarks: { type: String },
  },
  { timestamps: true },
);
const repairModel = model("system-repair", repairSchema);
module.exports = repairModel;
