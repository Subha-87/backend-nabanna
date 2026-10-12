const { Schema, model, default: mongoose } = require("mongoose"); // Erase if already required

var EstimateSchema = new Schema({
  memo: Number,
  date: Date,
  est_copy_url: String,
  work_name: String,
  cost: String,
  department: String,
  room: String,
  req_letter_url: String,
  apprv_copy_url: String,
  status: String,
  remarks: String,
  chl_date:Date,
  challan_img_url: {
    type: [String],
    default: [],
  },
  agency:String,
  work_order_url:String,
  nit_no:String

});

//const estimate = mongoose.models.Estimate_Nabanna || mongoose.model("Estimate_Nabanna", EstimateSchema);
const estimate = mongoose.model("Estimate_Nabanna", EstimateSchema);

module.exports = estimate;
