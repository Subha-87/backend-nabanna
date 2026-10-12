const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
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
    domain: {
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

const Session_IT_Personnel =
  mongoose.models.Session_itUSer || mongoose.model("Session_itUSer", sessionSchema);
module.exports = Session_IT_Personnel;

//export default mongoose.models.Session ||
// mongoose.model("Session", sessionSchema);
