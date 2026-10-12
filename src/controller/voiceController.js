const voiceCollection = require("../models/voiceDataModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// GET Voice Data from Database //
async function getVoiceData(req, resp) {
  //console.log(req.body)
  const { it_person } = req.params;
  //console.log(it_person)
  try {
    const voiceData = await voiceCollection
      .aggregate([
        {
          $match: { it_personnel: it_person },
        },
        {
          $project: {
            assignDate: 1,
            lettertype: 1, // what condition for $ifNull in array datatype? //
            username: 1,
            designation: 1,
            department: 1,
            room: 1,
            contact: { $ifNull: ["$contact", "No Contact"] },
            p_level: { $ifNull: ["$p_level", "none"] },
            it_personnel: 1,
            status: 1,
            remarks: 1,
          },
        },
      ])
      .sort({ _id: -1 });
    if (!voiceData.length) {
      //return resp.status(404).send({ message: 'No voice data found' })
      return sendError(resp, 404, "No voice data is found");
    } else {
      //return resp.status(200).send(voiceData); // always send 200 status for check frontend status // otherwise send 404 status
      return sendSuccess(resp, 200, "Data Fetched Successfull", voiceData);
    }
  } catch (error) {
    //   console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
}

// POST Voice Data to Database //

async function postVoiceData(req, resp) {
  //console.log(req.body);
  try {
    const newVoiceData = new voiceCollection(req.body);
    const result = await newVoiceData.save();

    return sendSuccess(resp, 201, "Voice Task Set added successfully", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

// UPDATE Voice Data in Database BY Parth it Self //

async function updateVoiceData(req, resp) {
  //console.log(req.body)
  try {
    const { editId } = req.params;
    const { it_personnel, status, setRemarks } = req.body;
    //console.log(req.body)

    const options = { new: true };

    const result = await voiceCollection.findByIdAndUpdate(
      editId,
      { it_personnel, status, remarks: setRemarks },
      options,
    );
    //console.log(result)

    if (!result) {
      //return resp.status(404).send({ message: "Voice data not found" });
      return sendError(resp, 404, "Voice data is not found");
    } else {
      return sendSuccess(resp, 200, "Voice Task updated successfully", result);
    }
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

//Re Assign Task send to Partha by JE//
const editDatafromJE = async (req, resp) => {
  //console.log(req.body)
  try {
    const { e_id } = req.params;
    const { it_personnel, status, setRemarks, assignDate } = req.body;
    const result = await voiceCollection.findByIdAndUpdate(
      e_id,
      { it_personnel, status, remarks: setRemarks, assignDate },
      { new: true },
    );
    if (!result) return sendError(resp, 404, "Cant Update");
    return sendSuccess(
      resp,
      200,
      `Task is Re-Assigned to : ${it_personnel}`,
      result,
    );
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

module.exports = {
  getVoiceData,
  postVoiceData,
  updateVoiceData,
  editDatafromJE,
};
