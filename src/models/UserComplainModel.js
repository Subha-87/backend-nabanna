const { Schema, model } = require('mongoose')

const complainSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    date: Date,
    domain:String,
    type:String,
    complain:String,
    username:String,
    designation:String,
    department:String,
    room:String,
    contact:Number,
    status:String,
    remarks:String
    
})

const userComplainModel = model('user-complain-data', complainSchema)

module.exports = userComplainModel ;
    
   