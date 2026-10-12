const NabannaLetterCollection = require("../models/requisitionModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const path = require("path");

// POST NABANNA LETTER 1st TIME INTO TO DATABASE WITH JPG FILE //
async function postITletter(req, resp) {
  try {
    const uploadfileInfo = req.file;
    //console.log('image Details:', uploadfileInfo)
    const letterInfo = req.body;
    // 🔥 FIX HERE
    let lcategory = letterInfo.lcategory;

    try {
      lcategory = JSON.parse(lcategory); // when sent as JSON string
    } catch (e) {
      // fallback if single value or old format
      if (typeof lcategory === "string") {
        lcategory = lcategory.split(",").map((v) => v.trim());
      } else {
        lcategory = [lcategory];
      }
    }
    // override with clean array
    letterInfo.lcategory = lcategory;

    const total_info_forDB = { ...letterInfo, ...uploadfileInfo };
    //console.log(total_info_forDB);
    const letter = new NabannaLetterCollection(total_info_forDB);
    const result = await letter.save();
    return sendSuccess(resp, 200, "LETTER SAVED SUCCESSFULLY", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

// GET ALL SUBMITTED LETTER FORM DATABASE //

async function getITletter(req, resp) {
  try {
    const result = await NabannaLetterCollection.find().sort({ date: -1 }); // .sort({ _id: -1 }) id for updated latestes insert on top //
    if (!result.length) return sendError(resp, 404, "No Letter Found");
    return sendSuccess(resp, 200, "Letter Found", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

// **Image Control// --> for show img in frontend table data**//
async function getLetterImg(req, resp) {
  const { id } = req.params;
  //console.log(id)
  try {
    let letter = await NabannaLetterCollection.findById(id);
    //console.log(letter)
    if (!letter) {
      resp.status(404).json({ msg: "no image found" });
    } else {
      const imagepath = path.join(
        __dirname,
        "../LetterUpload",
        letter.filename,
      );
      resp.sendFile(imagepath); // for sending file from server to client //
      //console.log(imagepath)
    }
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

// GET SINGLE LETTER DATA INFO WHAT IS POPULATE IN MODAL FORM FOR UPDATE // ** NOt USED
async function getSingleLetterInfo(req, resp) {
  const { id } = req.params;
  //console.log(id)
  try {
    const letterInfo = await NabannaLetterCollection.findById(id, {
      lcategory: 0,
      filename: 0,
      originalname: 0,
      path: 0,
    }); //Model.findById(id,[projection],[options])
    if (!letterInfo) return sendError(resp, 404, "No Data");
    return sendSuccess(resp, 200, "Data Found", letterInfo);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

// POST UPDATED LETTER TASK ASSIGIN PERSON INFO AND SUBMIT TO DATABASE RESULT REFLECT ON JE REQ DATATABLE //
async function postUpdateLetterInfo(req, resp) {
  try {
    // set update //
    //const { id } = req.params
    const { taskId } = req.params;
    //console.log(taskId,req.body.it_personnel)
    const { assignDate, it_personnel, status, setRemarks } = req.body;
    const update = {
      date: assignDate,
      itPerson: it_personnel,
      status, // key:value pair same//
      remarks: setRemarks,
    };
    const options = { new: true };
    //console.log(id)

    const updatedResult = await NabannaLetterCollection.findByIdAndUpdate(
      taskId,
      update,
      options,
    );

    if (!updatedResult) return sendError(resp, 404, "Cant Update");
    const { it_person } = updatedResult;
    return sendSuccess(
      resp,
      200,
      `Task Assign successfully to :${it_person}`,
      updatedResult,
    );
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

// Update info coming from room no 106 & 806 and refelct on 105 JE database notification show in 105 or 806//
const postUpdatefrom106 = async (req, resp) => {
  //console.log('for 105:', req.body)
  const { e_id } = req.params;
  const { username, it_personnel, status, setRemarks } = req.body;
  //const filter = { username: req.body.username };
  const update = {
    itPerson: it_personnel,
    status,
    remarks: setRemarks,
  };
  const options = { new: true };
  try {
    const newResult = await NabannaLetterCollection.findByIdAndUpdate(
      e_id,
      update,
      options,
    );
    if (!newResult) return sendError(resp, 404, "Cant Update");
    return sendSuccess(resp, 200, "Task Updated to JE_IT_Nabanna", newResult);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// Edit Letter from JE Nabanna from room -105 by self//
const updateLetterfromJE = async (req, resp) => {
  try {
    const { edit_id } = req.params;
    //console.log(edit_id)
    const { remarks, status } = req.body;
    const result = await NabannaLetterCollection.findByIdAndUpdate(
      edit_id,
      { remarks, status },
      { new: true },
    );
    if (!result) return sendError(resp, 404, "Cant Update");
    return sendSuccess(resp, 200, "Updated Successfully", result.remarks);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

// DELETE SINGLE LETTER INFO FROM DATABASE //
async function delelteItLetter(req, resp) {
  try {
    const { del_id } = req.params;
    const result = await NabannaLetterCollection.findByIdAndDelete(del_id);
    if (!result) return sendError(resp, 404, "Cant Delete");
    return sendSuccess(resp, 200, "Letter Deleted Successfully");
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

// Search letter Based on User Information //
async function searchLetter(req, resp) {
  //console.log(req.params)
  try {
    const searchValue = req.params.search_key;
    //console.log(searchValue)
    const searchResult = await NabannaLetterCollection.find({
      $or: [
        { username: { $regex: searchValue, $options: "i" } },
        { designation: { $regex: searchValue, $options: "i" } },
        { department: { $regex: searchValue, $options: "i" } },
        { room: { $regex: searchValue, $options: "i" } },
      ],
    });
    if (!searchResult.length) return sendError(resp, 404, "No Letter Found");
    return sendSuccess(resp, 200, "Letter Found", searchResult);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
}

// Get Solved Letter Details based on Domain(Internet/Voice/PC-Hardware) & Status//

const solvedITLetter = async (req, resp) => {
  const { it_domain } = req.params;
  try {
    const result = await NabannaLetterCollection.find({
      lcategory: { $in: [it_domain] },
      status: "Complete",
    }).sort({ date: -1 });
    if (!result.length) return sendError(resp, 404, "No Letter Found");
    return sendSuccess(resp, 200, "Data Found", result);
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

module.exports = {
  postITletter,
  getITletter,
  getLetterImg,
  getSingleLetterInfo,
  postUpdateLetterInfo,
  delelteItLetter,
  searchLetter,
  postUpdatefrom106,
  updateLetterfromJE,
  solvedITLetter,
};
