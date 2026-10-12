const { Schema, model } = require('mongoose')

const requisitionSchema = new Schema({
    date: Date,
    filename:'String',
    originalname:'String',
    path:'String',
    username:'String',
    designation:'String',
    department:'String',
    subgroup:String,
    lcategory:[],
    room:'String',
    contact:'String',
    itPerson:'String',
    remarks:String,
    status:String,
  
})

const NabannaRequisitionModel = model('nabanna_letter',requisitionSchema)
module.exports = NabannaRequisitionModel