import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    public_id: String,
    url: String,
    originalName: String,
    mimetype: String,
    size: Number,
  },
  { _id: false }
);

export default FileSchema;