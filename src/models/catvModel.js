const mongoose = require("mongoose");
const { Schema,model } = mongoose;

const catvSchema = new Schema({
    assignDate:Date,
    filename:'String',
    originalname:'String',
    path:'String',
    lettertype:[],
    username:"String",
    
    designation : "String",
    department : "String",
    subgroup:"String",
    room : "String",
    contact:"String",
    p_level:"String",
    it_personnel:"String",
    status:"String",
    remarks:String,

    
    
})

const catvmodel = mongoose.model("cabletv",catvSchema)

module.exports = catvmodel