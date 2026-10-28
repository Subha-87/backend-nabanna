const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base upload directory
const uploadBaseDir = path.join(process.cwd(), "uploads", "images");

// All upload folders
const uploadDirs = {
  challan: path.join(uploadBaseDir, "ChallanFolder"),
  workOrder: path.join(uploadBaseDir, "WorkOrderFolder"),
  approval: path.join(uploadBaseDir, "ApprovalFolder"),
  estimate: path.join(uploadBaseDir, "EstimateFolder"),
  requisition: path.join(uploadBaseDir, "RequisitionFolder"),
  meetings: path.join(uploadBaseDir, "Meetings"),
};

// Create every directory if it doesn't already exist
Object.values(uploadDirs).forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

// Handling Challan Img(single or multi) & Work Order Img(single) //

//ChallanImg(single or multi) and Work OrderImg(single)://
const chln_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "work_order") {
      cb(null, uploadDirs.workOrder);
    } else if (file.fieldname === "challan_img") {
      cb(null, uploadDirs.challan);
    } else {
      cb(new Error("Invalid field name"));
    }
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// 3) Set Common File Filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

// Main thing to export //
const upload_challan_copy = multer({
  storage: chln_storage,
  fileFilter,
});

// Handling Approval Image(Single) Multer Proccess //
//Approval letter://

const apprv_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.approval);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload_apprv_letter = multer({
  storage: apprv_storage,
});

// Handling Estimate & Requsition Files //

// Set up Storage for uploaded files ->Estimate & Requsition
const set_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "est_copy") {
      cb(null, uploadDirs.estimate);
    } else if (file.fieldname === "req_letter") {
      cb(null, uploadDirs.requisition);
    } else {
      cb(new Error("Invalid field name"));
    }
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

//Validating File Types:  1
const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    //cb(null, false);
    cb(new Error("Invalid file type"));
  }
};

// Create the multer instance
const upload_letter = multer({
  storage: set_storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: filefilter,
});

// MEETING FILES UPLOAD//

const meetingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.meetings); //  The folder where files will be saved
  },
  filename: (req, file, cb) => {
    // 1. Get a random number suffix
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // 2. Extract the file extension (e.g., '.png')
    const extension = path.extname(file.originalname);
    // 3. Extract the base filename without extension
    const baseName = path.basename(file.originalname, extension);
    // 4. Combine them safely
    cb(null, baseName + "-" + uniqueSuffix + extension);
  },
});

const letterUpload = multer({
  storage: meetingStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = {
  upload_challan_copy,
  upload_apprv_letter,
  upload_letter,
  letterUpload,
};

/**
 * 🧠 VERY IMPORTANT RULE FOR MULTER(Remember forever)
One file	       ->   upload.single()
One array	       ->   upload.array()
Multiple fields	   ->   upload.fields()

 * 🧠 Mental Model (REMEMBER THIS)
single()  → req.file → direct object
array()   → req.files → []
fields() → req.files → { field: [] }

 * 
 * 
 */
