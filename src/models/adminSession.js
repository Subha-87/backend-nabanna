const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userInfo: {
    username: {
      type: String, // Store arbitrary session data
      required: true,
    },
    rank: {
      type: String, // Store arbitrary session data
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },

  createdAt: {
    type: Date,
    //default: Date.now,
    //expires: "1h", // Automatically delete sessions after 1 hour
  },
  expiry: {
    type: Date,
  },
});

sessionSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
module.exports = Session;