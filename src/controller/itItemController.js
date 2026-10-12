const itItemCollection = require("../models/incomingItemData");
const { sendSuccess, sendError } = require("../utils/apiResponse");
//const validAdmin = require("../models/adminSession");

// POST INCOMING IT ITEMS TO DATABASE //

async function postItItemsData(req, resp) {
  //console.log({ item: req.body });
  try {
    const newItItems = new itItemCollection(req.body);
    const result = await newItItems.save();
    return sendSuccess(resp, 200, "IT ITEMS SAVED SUCCESSFULLY", result);
  } catch (error) {
    //console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
}

// GET IT ITEMS FROM DATABASE //
async function getItItemsData(req, resp) {
  //console.log(req.headers)
  try {
    //const authHeader = req.headers["authorization"];
    //const validSession = req.session_id;
    //const cookie = req.headers['Cookie'];
    //console.log({ express_auth: validSession });
    //const result = await validAdmin.findOne({sessionId:validSession})
    //console.log(result)
    //if (!result.sessionId) return sendError(resp, 401, "Unauthorized Access");
    //resp.status(401).send({ message: "Unauthorized Access", data: null });

    const getItItemData = await itItemCollection.find().sort({ date: -1 });
    if (!getItItemData.length)
      return sendError(resp, 404, "No Data is Found in System");
    return sendSuccess(resp, 200, "Data Fetched Successful", getItItemData);
    /*if (!getItItemData.length === 0) {
      resp.status(404).send({
        msg: "NO DATA FOUND",
      });
    } else {
      resp.status(200).send(getItItemData);
    }*/
  } catch (error) {
    //console.error(error);
    return sendError(resp, 500, "Internal Server Error");
    //resp.status(500).send({ message: "Server error", error });
  }
}
// UPDATE IT ITEMS NABANNA //

const updateItemData = async (req, resp) => {
  const { editId } = req.params;
  const { allocation, remarks, room, stock } = req.body;
  try {
    const result = await itItemCollection.findByIdAndUpdate(
      editId,
      { allocation, room, remarks, stock },
      { new: true }, //If set to true, returns the modified document rather than the original.//
    );
    //console.log(result);
    if (!result) return sendSuccess(resp, 404, "Cant Updated");
    return sendSuccess(resp, 200, "Update Successful", result);
  } catch (error) {}
  return sendError(resp, 500, "Internal Server Error");
};

// SEARCH PARTICULA HARDWARE ITEM //
const getSearchItemData = async (req, resp) => {
  const searchValue = req.query.searchKey?.trim()
  console.log(searchValue)
  try {
    const searchResult = await itItemCollection
      .find({
        $or: [
          { "itItems.serial": { $regex: searchValue, $options: "i" } },
          { "itItems.item": { $regex: searchValue, $options: "i" } },
          { "itItems.model": { $regex: searchValue, $options: "i" } },
          { "itItems.make": { $regex: searchValue, $options: "i" } },
          { sender: { $regex: searchValue, $options: "i" } },
          { challan: { $regex: searchValue, $options: "i" } },
          { room: { $regex: searchValue, $options: "i" } },
          { allocation: { $regex: searchValue, $options: "i" } },
        ],
      })
      .sort({ _id: -1 });

    if (!searchResult.length)
      return sendError(resp, 404, "No Such ITEMs is deliverd in Nabanna");
    return sendSuccess(resp, 200, "Data Found", searchResult);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

const deleteItemData = async (req, resp) => {
  try {
    const { deleteId } = req.params;
    //console.log(deleteId);
    const result = await itItemCollection.findByIdAndDelete(deleteId);

    if (!result) return sendError(resp, 404, "Cant Deleted");
    return sendSuccess(resp, 200, "Item Deleted Successfully");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

module.exports = {
  postItItemsData,
  getItItemsData,
  getSearchItemData,
  updateItemData,
  deleteItemData,
};
