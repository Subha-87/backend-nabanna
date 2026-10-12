const {Schema,model} = require('mongoose')

const it_Material_Schema = new Schema({
    date:Date,
    sender:{
        type:String
    },
    challan:{
        type:String
    },
    itItems :[{
        item:{
            type:String
        },
        model:{
            type:String,
            default:"--"
        },
        make:{
            type:String,
            default:"--"
        },
        qty:{
            type:String
        },
        serial:{
            type:String
        }
    }],
    stock:{
        type:String
    },
    allocation:{
        type:String
    },
    room:{
        type:String,
        default:"--"
    },
    remarks:{
    type:String
    }
})

const ItemModel = model('incoming_Items',it_Material_Schema)
module.exports = ItemModel