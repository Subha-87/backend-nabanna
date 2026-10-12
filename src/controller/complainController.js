const complainCollection = require("../models/UserComplainModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// Post Complain Incoming Complain to DataBase //

const postItComplainData = async (req, resp) => {
  //const {username} = req.body;
  //console.log(req.body);

  try {
    const postInfo = new complainCollection(req.body);
    const result = await postInfo.save();
    return sendSuccess(resp, 200, "Complain Registered SuccessFully", result);
  } catch (error) {
    //console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Get All Comaplin Data For JE & AE //

const getAllComplain = async (req, resp) => {
  try {
    const result = await complainCollection
      .find()
      .sort({ date: -1, createdAt: -1 });
    if (!result.length) return sendError(resp, 404, "No Complain Found");

    return sendSuccess(resp, 200, "Data Fetched Successfull", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// GET Only Specific Complain Data Based on Domain //

const getITComplain = async (req, resp) => {
  const { domain } = req.params;

  try {
    const result = await complainCollection
      .find({ domain, status: { $in: ["Pending", "In Progress"] } })
      .sort({ _id: -1 });
    if (!result.length) return sendError(resp, 404, "No Complain Found");
    return sendSuccess(resp, 200, "Date Fetched Successful", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Get Only Resolved IT Complain Data for based on Specific Domain //

const getITResolvedData = async (req, resp) => {
  const { it_domain } = req.params;
  //console.log(it_domain)
  try {
    const result = await complainCollection
      .find({ domain: it_domain, status: "Complete" })
      .sort({ _id: -1 });
    if (!result.length)
      return sendError(resp, 404, "No Resolved User Complain IT-Data is Found");
    return sendSuccess(resp, 200, "Solved Complain Fetched Successful", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Update ALL TYPE Nabanna Users Complain //

const updateComplain = async (req, resp) => {
  const { edit_id } = req.params;
  const { setRemarks, status } = req.body;
  //console.log(req.body);
  const updateInfo = {
    status,
    remarks: setRemarks,
  };
  const options = { new: true };
  try {
    const updateResult = await complainCollection.findByIdAndUpdate(
      edit_id,
      updateInfo,
      options,
    );
    if (!updateResult) {
      return sendError(resp, 404, "Cant Update");
    } else {
      return sendSuccess(
        resp,
        200,
        "Status Updated to JE-IT-Nabanna",
        updateResult,
      );
    }
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Filter IT Complain Data by Date Range Based on Specific Domain //
const getSolvedItComplainbyDate = async (req, resp) => {
  const { it_wing } = req.params;
  console.log("monthy report for :", it_wing);
  try {
    const { startDate, endDate } = req.query;
    const filters = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      domain: it_wing,
      status: "Complete",
    };
    const result = await complainCollection.find(filters).sort({ date: 1 });
    if (!result.length) return sendError(resp, 404, "No Search Result");
    return sendSuccess(resp, 200, "Data Fetched is Successful", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Search All User Complain Data by Search Key Word //
const getSearchAllResult = async (req, resp) => {
  try {
    const { s_key } = req.params;
    //console.log(s_key);
    let query = {};
    if (s_key) {
      const orConditions = [
        // String fields
        { username: { $regex: s_key, $options: "i" } },
        { designation: { $regex: s_key, $options: "i" } },
        { department: { $regex: s_key, $options: "i" } },
        { room: { $regex: s_key, $options: "i" } },
      ];
      // Check if search is a valid number
      const contact_no = Number(s_key);
      if (!isNaN(contact_no)) {
        orConditions.push({ contact: contact_no }); // for number(int) field
      }
      //query = { status:'Complet',$or: orConditions};
      query = { $or: orConditions }; // for all JE ,Net & Voice Personnel //
    }

    const result = await complainCollection.find(query).sort({ _id: -1 });
    //console.log(result);
    if (!result.length)
      return sendError(resp, 404, "No User Complain is Found");
    return sendSuccess(resp, 200, "Search Log Found", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// GET COMPLAIN RESULT BASED ON DOMAIN //
const getSearchDomainResult = async (req, resp) => {
  
  try {
    const { it_wing } = req.params;
    const { query: s_key } = req.query;

    let mongoQuery = { domain: it_wing };

    if (s_key) {
      const orConditions = [
        { username: { $regex: s_key, $options: "i" } },
        { designation: { $regex: s_key, $options: "i" } },
        { department: { $regex: s_key, $options: "i" } },
        { room: { $regex: s_key, $options: "i" } },
      ];

      const contact_no = Number(s_key);

      if (!isNaN(contact_no)) {
        orConditions.push({ contact: contact_no });
      }

      mongoQuery.$or = orConditions;
    }

    const result = await complainCollection.find(mongoQuery).sort({ _id: -1 });
    if (!result.length)
      return sendError(resp, 404, "No User Complain is Found");
    return sendSuccess(resp, 200, "Search Result Found", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};
// Delete IT Complain //
const deleteITComplain = async (req, resp) => {
  try {
    const { delId } = req.params;
    const result = await complainCollection.findByIdAndDelete(delId);
    if (!result) return sendError(resp, 404, "Cant Deleted");
    return sendSuccess(resp, 200, "Complain Delete Successfully");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

module.exports = {
  postItComplainData,
  getAllComplain,
  getITComplain,
  getITResolvedData,
  updateComplain,
  getSolvedItComplainbyDate,
  getSearchAllResult,
  deleteITComplain,
  getSearchDomainResult,
};
