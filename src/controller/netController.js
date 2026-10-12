const netCollection = require("../models/networkdataModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// Assign Task By JE or Forward Voice Work what need assitance with IT Personel

const postTaskDataforNet = async (req, resp) => {
  //console.log({task:req.body});
  //const authorizationHeader = req.get('Authorization');
  //console.log(authorizationHeader)
  try {
    const netTaskData = new netCollection(req.body);
    //console.log(req.body);
    const result = await netTaskData.save();
    const { it_personnel } = result;

    return sendSuccess(
      resp,
      201,
      `New Task Assign successfully to :${it_personnel}`,
      result,
    );
  } catch (error) {
    //console.error(error.code);
    if (error.code == 11000)
      return sendError(resp, 500, "Task Already Assign to IT-Personnel");
    //resp.status(500).send({ message: "Task Already Assign to IT-Personnel" });

    return sendError(resp, 500, "Internal Server Error");
  }
};

// GET ALL IT TASK FOR IT PERSONNEL //

const getTaskDataforNet = async (req, resp) => {
  const it_person = req.params.it_person;

  try {
    const alltaskData = await netCollection
      .find({ it_personnel: it_person })
      .sort({ _id: -1 });

    if (!alltaskData.length) {
      return sendError(resp, 404, "No Task Found");
    }
    return sendSuccess(resp, 200, "Task Fetched Successfull", alltaskData);
  } catch (error) {
    //console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Get Task Data for update for single id //

const getSingleTaskDataforUpdate = async (req, resp) => {
  const { id } = req.params;
  try {
    const result = await netCollection.findById(id, {
      assignDate: 0,
      contact: 0,
      p_level: 0,
      it_personnel: 0,
    });
    if (!result) {
      //return resp.status(404).send({ msg: "NO DATA" });
      return sendError(resp, 404, "NO DATA FOUND");
    } else {
      //return resp.status(200).send(result);
      return sendSuccess(resp, 200, "Data Fetched Successful", result);
    }
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// POST SINGLE UPDATED DATA FOR SELF or PASS TO OTHER IT PERSON BY IT PERSONNEL-->PUT METHOD //

const postUpdatateData = async (req, resp) => {
  try {
    const { id } = req.params;
    const { it_personnel, status, setRemarks } = req.body;
    //const updatedInfo = req.body
    //console.log("FOR 106:", id, req.body);
    //console.log(it_personnel);
    const options = { new: true };
    //console.log(id)

    const updatedResult = await netCollection.findByIdAndUpdate(
      id,
      {
        it_personnel,
        status,
        remarks: setRemarks,
      },
      options,
    );

    if (!updatedResult) {
      //return resp.status(404).send({ message: "Cant Update" });
      return sendError(resp, 404, "Cant Update");
    } else {
      const { it_personnel } = updatedResult;
      /*return resp.status(200).send({
        message: `Task is Updated & Assign to : ${it_personnel}`,
        data: updatedResult,
      });*/
      sendSuccess(
        resp,
        200,
        `Task is Updated & Assign to : ${it_personnel}`,
        updatedResult,
      );
    }
  } catch (error) {
    //resp.status(500).send({ message: "Server Error" });
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Task Re-Assign to network personnel By JE/AE //
const editDatafromJE = async (req, resp) => {
  try {
    const { e_id } = req.params;
    const { it_personnel, status, setRemarks, assignDate } = req.body;
    //console.log(setRemarks)
    const result = await netCollection.findByIdAndUpdate(
      e_id,
      { it_personnel, status, remarks:setRemarks, assignDate },
      { new: true },
    );
    //console.log(result)
    if (!result)
      //return resp.status(404).json({ message: "Cant Update", succes: false });
      return sendError(resp, 404, "Cant Update");

    /*return resp.status(200).json({
      message: `Task is Re-Assigned to : ${it_personnel}`,
      data: result,
    });*/
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
  postTaskDataforNet,
  getTaskDataforNet,
  getSingleTaskDataforUpdate,
  postUpdatateData,
  editDatafromJE,
};
