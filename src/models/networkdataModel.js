const {Schema,model}  = require('mongoose')
// Create Newtwork Schema //

const networkSchema = new Schema({
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

const netWorkmodel = model("Network-Data",networkSchema)

module.exports = netWorkmodel