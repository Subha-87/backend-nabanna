const {Schema,model} = require('mongoose')

const voiceSchema = new Schema({
    assignDate:Date,
    filename:'String',
    originalname:'String',
    path:'String',
    lettertype:[],
    username:"String",
    
    designation : "String",
    department : "String",
    room : "String",
    contact:"String",
    p_level:"String",
    it_personnel:"String",
    status:"String",
    remarks:"String"
    
})

const voiceModel = model('telephone-data', voiceSchema)

module.exports = voiceModel;