const mongoose = require("mongoose");
const boxCollection = require("../models/setTopBox");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// POST User Details with BOX Details //

const addUserBox = async (req, resp) => {
  try {
    const {
      username,
      designation,
      department,
      floor,
      room,
      boxMake,
      boxType,
      boxCategory,
      boxId,
      cardId,
      accessories,
      boxStatus,
      condition,
      installationDate,
      boxPresent,
      temporaryAllotment,
      remarks,
    } = req.body;

    // Required field validation
    if (
      !username ||
      !designation ||
      !department ||
      !floor ||
      !room ||
      !boxMake ||
      !boxType ||
      !boxCategory ||
      !boxId ||
      !cardId
    ) {
      return sendError(resp, 400, "Required fields are missing");
    }

    // Check duplicate Box ID
    const existingBox = await boxCollection.findOne({
      $or: [{ boxId }, { cardId }],
    });

    if (existingBox) {
      return sendError(resp, 409, "Box ID or Card ID already exists");
    }

    // Create new record
    const newBox = await boxCollection.create({
      username,
      designation,
      department,
      floor,
      room,
      boxMake,
      boxType,
      boxCategory,
      boxId,
      cardId,
      accessories: accessories || [],
      boxStatus,
      condition,
      installationDate,
      boxPresent,
      temporaryAllotment,
      remarks,
    });

    return sendSuccess(
      resp,
      201,
      "Set Top Box information added successfully",
      newBox,
    );
  } catch (error) {
    console.error(error);
    // Mongo Duplicate Key Error
    if (error.code === 11000) {
      return sendError(resp, 409, "Box ID or Card ID already exists");
    }

    return sendError(resp, 500, "Internal Server Error");
  }
};

const getAllBox = async (req, resp) => {
  try {
    const boxes = await boxCollection.find().sort({ createdAt: -1 });
    if (!boxes.length) return sendError(resp, 404, "No Box Details found");
    return sendSuccess(resp, 200, "Box details fetched successfully", boxes);
  } catch (error) {
    console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
};

const deleteBox = async (req, resp) => {
  try {
    const { del_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(del_id)) {
      // This prevents errors when someone sends an invalid ID.
      return sendError(resp, 400, "Invalid Box ID");
    }
    const deletedBox = await boxCollection.findByIdAndDelete(del_id);
    if (!deletedBox) {
      return sendError(resp, 404, "Box record not found");
    }
    return sendSuccess(resp, 200, "Box Details Deleted Successful");
  } catch (error) {
    console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
};

const editBoxInfo = async (req, resp) => {
  try {
    const { edit_id } = req.params;
    // ** EDIT CODE LOGIC //
    if (!mongoose.Types.ObjectId.isValid(edit_id)) {
      return sendError(resp, 400, "Invalid Box ID");
    }

    const updatedBox = await boxCollection.findByIdAndUpdate(
      edit_id,
      req.body,
      {
        new: true, // return updated document
        runValidators: true, // apply schema validations
      },
    );

    if (!updatedBox) {
      return sendError(resp, 404, "Box record not found");
    }
    return sendSuccess(resp, 200, "Change Successfull", updatedBox);
  } catch (error) {
    console.error(error);
    // Duplicate boxId/cardId
    if (error.code === 11000) {
      return sendError(resp, 409, "Box ID or Card ID already exists");
    }
    return sendError(resp, 500, "Internal Server Error");
  }
};

const searchBoxDetails = async (req, resp) => {
  //console.log(req.query);
  try {
    const { query } = req.query;

    if (!query?.trim()) {
      return sendError(resp, 400, "Search query is required");
    }

    const boxData = await boxCollection.find({      //using find(), MongoDB always returns an array:
      $or: [
        { floor: { $regex: query, $options: "i" } },
        { room: { $regex: query, $options: "i" } },
        { department: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { boxId: { $regex: query, $options: "i" } },
        { cardId: { $regex: query, $options: "i" } },
      ],
    });

    if (!boxData.length) {
      return sendError(resp, 404, "No Box Details Found");
    }

    return sendSuccess(resp, 200, "Box Details Found", boxData);
  } catch (error) {
    console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
};

module.exports = {
  addUserBox,
  getAllBox,
  deleteBox,
  editBoxInfo,
  searchBoxDetails,
};
