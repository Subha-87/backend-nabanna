const meetingCollection = require("../models/meetingModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const postMeetingData = async (req, resp) => {
  try {
    const {
      meetingDate,
      programmeName,
      organiser,
      venue,
      meetingTime,
      agency,
      itemDetails,
      remarks,
    } = req.body;
    const letterData = req.file;

    const payload = {
      meetingDate,
      programmeName,
      organiser,
      venue,
      meetingTime,
      agency,
      itemDetails: itemDetails ? JSON.parse(itemDetails) : {},
      remarks,
      letter: letterData
        ? {
            filename: letterData.filename,
            originalName: letterData.originalName,
            mimeType: letterData.mimetype,
            path: letterData.path,
            size: letterData.size,
          }
        : undefined,
    };
    console.log(payload);
    const result = await meetingCollection.create(payload);
    return sendSuccess(
      resp,
      201,
      "Meeting Information Submit Successfully",
      result,
    );
  } catch (error) {
    console.error(error.message);
    return sendError(resp, 500, "Internal Server Error");
  }
};

const getMeetingData = async (req, resp) => {
  try {
    const meetings = await meetingCollection
      .find()
      .sort({ meetingDate: -1, createdAt: -1 });
    //console.log(meetings);

    if (meetings.length == 0)
      return sendError(resp, 404, "No Meeting Details Found");

    return sendSuccess(
      resp,
      200,
      "Meeting data fetched successfully",
      meetings,
    );
  } catch (error) {
    console.error(error);
    return sendError(resp, 500, "Internal Server Error");
  }
};

const editMeeting = async (req, resp) => {
  console.log(req.body);
  try {
    const { edit_id } = req.params;

    let itemDetails = req.body.itemDetails || {};

    if (typeof itemDetails === "string") {
      itemDetails = JSON.parse(itemDetails);
    }
    const updateData = {
      meetingDate: req.body.meetingDate,
      programmeName: req.body.programmeName,
      venue: req.body.venue,
      meetingTime: req.body.meetingTime,
      organiser: req.body.organiser,
      agency: req.body.agency,
      remarks: req.body.remarks,
      itemDetails,
    };

    // Only replace letter if a new file was uploaded
    if (req.file) {
      updateData.letter = {
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        path: req.file.path,
        size: req.file.size,
      };
    }

    const editResult = await meetingCollection.findByIdAndUpdate(
      edit_id,
      updateData,
      { new: true, runValidators: true },
    );
    console.log(editResult);
    if (!editResult) return sendError(resp, 404, "Update Error");
    return sendSuccess(resp, 200, "Update Successfull");
  } catch (error) {
    console.error(error);
    return sendError(resp, 500, "Internal Server Error", error.message);
  }
};

const deleteMeeting = async (req, resp) => {
  try {
    const { del_id } = req.params;
    const result = await meetingCollection.findByIdAndDelete(del_id);
    if (!result) return sendError(resp, 404, "Cant Deleted");
    return sendSuccess(resp, 200, " Deleted Successfully");
  } catch (error) {
    console.error(error);
    return sendError(resp, 500, "Internal Server Error", error.message);
  }
};

const searchMeeting = async (req, resp) => {
  try {
    const { s_key } = req.query;

    if (!s_key?.trim()) {
      return sendError(resp, 400, "Please enter a date or organiser name.");
    }

    const searchKey = s_key.trim();

      // Try to convert input into a date
    const parsedDate = parseSearchDate(searchKey);
    //console.log(parsedDate)

    let results = [];

    // ==================================
    // DATE SEARCH
    // ==================================
    if (parsedDate) {
      const startDate = new Date(parsedDate);

      const endDate = new Date(parsedDate);
      endDate.setUTCHours(23, 59, 59, 999);

      results = await meetingCollection
        .find({
          meetingDate: {
            $gte: startDate,
            $lte: endDate,
          },
        })
        .sort({ meetingDate: -1 });
    }


    
    // ==================================
    // ORGANISER SEARCH
    // ==================================
    else if (/^[a-zA-Z\s&.-]+$/.test(searchKey)) {
      results = await meetingCollection
        .find({
          organiser: {
            $regex: searchKey,
            $options: "i",
          },
        })
        .sort({ meetingDate: -1 });
    }

    // ==================================
    // INVALID SEARCH
    // ==================================
    else {
      return sendError(
        resp,
        400,
        "Invalid search. Please enter a date (DD-MM-YYYY) or organiser name.",
      );
    }

    // ==================================
    // NO RESULT
    // ==================================
    if (!results.length) {
      return sendError(resp, 404, "No meeting records found.");
    }

    // ==================================
    // SUCCESS
    // ==================================
    return sendSuccess(resp, 200, "Meeting records found", results);
  } catch (error) {
    console.error("Search Meeting Error:", error);

    return sendError(resp, 500, "Internal Server Error", error.message);
  }
};

module.exports = {
  postMeetingData,
  getMeetingData,
  editMeeting,
  deleteMeeting,
  searchMeeting,
};


// HELPER FUNCTION //
const parseSearchDate = (value) => {
  const input = value.trim();

  let day;
  let month;
  let year;

  // DD-MM-YYYY / D-M-YYYY
  let match = input.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);

  if (match) {
    [, day, month, year] = match;
  }

  // DD/MM/YYYY / D/M/YYYY
  if (!match) {
    match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);

    if (match) {
      [, day, month, year] = match;
    }
  }

  // DD.MM.YYYY / D.M.YYYY
  if (!match) {
    match = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);

    if (match) {
      [, day, month, year] = match;
    }
  }

  // YYYY-MM-DD
  if (!match) {
    match = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (match) {
      [, year, month, day] = match;
    }
  }

  // Not a date
  if (!day || !month || !year) {
    return null;
  }

  // Convert 2 digit year
  if (year.length === 2) {
    year = Number(year) < 50
      ? `20${year}`
      : `19${year}`;
  }

  day = Number(day);
  month = Number(month);
  year = Number(year);

  // Create UTC date
  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  // Validate actual date
  // Prevent things like 32/15/2026
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};