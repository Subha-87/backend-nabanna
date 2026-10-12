const catvCollection = require("../models/catvModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getCATVTask = async (req, resp) => {
  const it_person = req.params.it_person;

  try {
    const alltaskData = await catvCollection
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

const postCATVtask = async (req, resp) => {
  try {
    const catvTaskData = new catvCollection(req.body);
    //console.log(req.body);
    const result = await catvTaskData.save();
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

const updateTVTask = async (req, resp) => {
  try {
    const { id } = req.params;
    const { it_personnel, status, setRemarks } = req.body;

    const options = { new: true };

    const updatedResult = await catvCollection.findByIdAndUpdate(
      id,
      {
        it_personnel,
        status,
        remarks: setRemarks,
      },
      options,
    );

    if (!updatedResult) {
      return sendError(resp, 404, "Cant Update");
    } else {
      const { it_personnel } = updatedResult;

      sendSuccess(resp, 200, "Task is Updated", updatedResult);
    }
  } catch (error) {
    //resp.status(500).send({ message: "Server Error" });
    return sendError(resp, 500, "Internal Server Error");
  }
};

module.exports = {
  getCATVTask,
  postCATVtask,
  updateTVTask
};
