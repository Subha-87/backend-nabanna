const { model, Schema } = require("mongoose");

// Resusable Item Schema //
const itemSchema = new Schema(
  {
    itemName: String,
    qty: Number,
    specification: String,
  },
  { _id: false },
);

const categorySchema = new Schema(
  {
    category: {
      type: String,
      enum: ["VIDEO", "AUDIO", "NETWORK", "SURVEILLANCE", "HARDWARE", "Others"],
      required: true,
    },
    items: {
      type: [itemSchema],
      default: [],
    },
  },
  { _id: false },
);

const meetingSchema = new Schema(
  {
    // Meeting Information
    meetingDate: {
      type: Date,
      required: true,
    },

    letter: {
      filename: String, // stored filename
      originalName: String, // original uploaded file name
      mimeType: String, // image/jpeg, image/png, application/pdf
      path: String, // uploads/meeting/xxx.jpg
      size: Number, // file size in bytes
    },
    programmeName: {
      type: String,
      required: true,
    },
    organiser: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    meetingTime: {
      type: String,
      required: true,
    },
    agency: {
      type: String,
      required: true,
      trim: true,
      default: "Solutech System",
    },
    // meetingSchema
    itemDetails: {
      type: [categorySchema],
      default: [],
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const meetingCmModel = model("meeting", meetingSchema);

module.exports = meetingCmModel;
