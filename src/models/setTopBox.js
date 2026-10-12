const mongoose = require("mongoose");
const { Schema } = mongoose;

const boxSchema = new Schema(
  {
    // Employee Details
    username: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      trim: true,
      default: "-",
    },

    // Box Information
    boxType: {
      type: String,
      enum: ["SD", "HD"],
      required: true,
    },
    boxMake:{
        type:String,
        enum:["Meghbela","Tata Play"],
        required:true,
    },

    boxCategory: {
      type: String,
      enum: ["NEW", "OLD"],
      required: true,
    },

    boxId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    cardId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Accessories
    accessories: [
      {
        type: String,
        enum: ["HDMI Cable", "AV Cord", "Remote", "Adapter"],
      },
    ],

    // Box Status
    boxStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    condition: {
      type: String,
      enum: ["Good", "Bad"],
      default: "Good",
    },

    installationDate: {
      type: Date,
    },

    boxPresent: {
      type: Boolean,
      default: true,
    },

    temporaryAllotment: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

const setTopBoxModel = mongoose.model("nabannaBox", boxSchema);

module.exports = setTopBoxModel;
