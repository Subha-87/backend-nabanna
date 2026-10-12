const { Schema, model, default: mongoose } = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var itUserSchema = new Schema({
  name: {
    type: String,
    required: true,
   
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  rank: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
});

//Export the model

const ItPerson = mongoose.models.it_person || model("it_person", itUserSchema);

module.exports = ItPerson;
