const estimateCollection = require("../models/estimateNabannaModel");
const { findById } = require("../models/incomingItemData");
const { sendSuccess, sendError } = require("../utils/apiResponse");
//const connectDb = require('../config/database')
const postEstimateData = async (req, resp) => {
  //console.log("getting post request");
  //console.log(req.body);
  //const payload = req.body(); // frontend is sending formData not JSON data //
  const files = req.files;
  //console.log(files);
  //console.log({ post_request: payload });
  const { memo, date, work_name, cost, room, department, status, remarks } =
    req.body;
  //const estimatePath = "/EstimateFolder/" + files.est_copy[0].filename;
  const estimatePath = req.files?.est_copy?.[0]
    ? `/EstimateFolder/${req.files.est_copy[0].filename}`
    : null;
  //const requistionPath = "/RequisitionFolder/" + files.req_letter[0].filename;
  const requistionPath = req.files?.req_letter?.[0]
    ? `/RequisitionFolder/${req.files.req_letter[0].filename}`
    : null;

  const newDataforPost = {
    memo,
    date,
    est_copy_url: estimatePath,
    work_name,
    cost,
    department,
    room,
    req_letter_url: requistionPath,
    apprv_copy_url: null,
    status,
    remarks,
  };

  try {
    const result = await estimateCollection.insertOne(newDataforPost);
    return sendSuccess(resp, 200, "Saved Successfully", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

const getEstimateData = async (req, resp) => {
  try {
    const result = await estimateCollection.find().sort({ date: -1 }); //(sort most recent date first)
    if (!result.length) return sendError(resp, 404, "No Estimate Found");
    return sendSuccess(resp, 200, "Data Fetched Successfully", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Edit Existing Estimate Information //
const updateEstimateData = async (req, resp) => {
  const { editId } = req.params;
  const { status, remarks } = req.body;
  const updateStat = {
    status,
    remarks,
  };

  try {
    const result = await estimateCollection.findByIdAndUpdate(
      editId,
      updateStat,
      {
        new: true,
      },
    );
    if (!result) return sendError(resp, 404, "Cant Update");
    return sendSuccess(resp, 200, "Update Successful");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

const uploadApprovalImg = async (req, resp) => {
  const uploadAppvCopy = req.file; // req.file to handle single file //
  //console.log({approval:uploadAppvCopy})
  const { editId } = req.params;
  const ApprvPath = uploadAppvCopy
    ? `/ApprovalFolder/${uploadAppvCopy.filename}`
    : null;

  //console.log(ApprvPath);
  const uploadedInfo = {
    apprv_copy_url: ApprvPath,
  };
  try {
    const result = await estimateCollection.findByIdAndUpdate(
      editId,
      uploadedInfo,
      { new: true },
    );
    return resp.status(200).send({
      message: "Update Successful",
      data: result,
    });
  } catch (error) {
    return resp.status(500).send(error);
  }
};

// Search Estimate based on Memo/Work/Cost /Dept//
const searchEstimate = async (req, resp) => {
  const { s_key } = req.params;
  //console.log(s_key);
  try {
    let query = {};
    if (s_key) {
      const orConditions = [
        // String fields
        { work_name: { $regex: s_key, $options: "i" } },
        { cost: { $regex: s_key, $options: "i" } },
        { department: { $regex: s_key, $options: "i" } },
        { room: { $regex: s_key, $options: "i" } },
      ];
      // Check if search is a valid number
      const memo_no = Number(s_key);
      if (!isNaN(memo_no)) {
        orConditions.push({ memo: memo_no }); // for number(int) field
      }
      //query = { status:'Complet',$or: orConditions};
      query = { $or: orConditions }; // for all JE ,Net & Voice Personnel //
    }

    const result = await estimateCollection.find(query).sort({ _id: -1 }); // finding single or multiple document
    //console.log(result);
    if (result.length == 0) return sendError(resp, 404, "No Estimate Found");
    return sendSuccess(resp, 200, "Estimate Found", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Upload Estimate Challan //
const uploadChallan = async (req, resp) => {
  const { chl_date, memo, agency, nit_no } = req.body;
  //console.log(req.files)
  //console.log(req.body)

  // challan images process //
  const chllan_copy = req.files?.challan_img || []; // single or multiple img file send from frontend //
  const chllanImgPath = chllan_copy.map(
    (file) => `/ChallanFolder/${file.filename}`,
  );

  // // work order image

  const workOrderFile = req.files?.work_order?.[0]; // single img is coming from frotend //
  const workOrderUrl = workOrderFile
    ? `/WorkOrderFolder/${workOrderFile.filename}`
    : null;

  try {
    const result = await estimateCollection.findOneAndUpdate(
      { memo },
      {
        $set: {
          challan_img_url: chllanImgPath,
          work_order_url: workOrderUrl,
          chl_date,
          agency,
          nit_no,
        },
      },
      { returnDocument: "after" },
    );
    //console.log(result);
    if (!result) return sendSuccess(resp, 404, "Memo Not Found");
    return sendSuccess(resp, 200, "Update Succesfull");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// View Button -> Challan & Order //
const showChallanwithOrder = async (req, resp) => {
  console.log("requesting...");
  const { reqId } = req.params;
  //console.log({view_key:reqId})
  try {
    const result = await estimateCollection.findById(reqId);
    if (!result) return sendError(resp, 404, "No Result Found..");
    const order = result.work_order_url;
    const challan = result.challan_img_url;
    return resp.status(200).json({
      success: true,
      challan_img: challan,
      order_img: order,
      order_no: result.nit_no,
    });
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

const deleteEstimate = async (req, resp) => {
  try {
    const { del_id } = req.params;
    const result = await estimateCollection.findByIdAndDelete(del_id);
    if (!result) return sendError(resp, 404, "Cant Deleted Estimate");
    return sendSuccess(resp, 200, "Estimate Deleted Successfully");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

module.exports = {
  postEstimateData,
  getEstimateData,
  updateEstimateData,
  uploadApprovalImg,
  searchEstimate,
  uploadChallan,
  showChallanwithOrder,
  deleteEstimate
};

/*
// 400 - Bad Request
res.status(400).json({ success: false, error: { code: 400, message: "Invalid input" } });

// 401 - Unauthorized
res.status(401).json({ success: false, error: { code: 401, message: "Unauthorized access" } });

// 403 - Forbidden
res.status(403).json({ success: false, error: { code: 403, message: "Access denied" } });

// 404 - Not Found
res.status(404).json({ success: false, error: { code: 404, message: "Data not found" } });

// 500 - Internal Server Error
res.status(500).json({ success: false, error: { code: 500, message: "Something went wrong" } });

*/
