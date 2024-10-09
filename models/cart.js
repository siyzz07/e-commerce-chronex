const { min, max } = require('moment')
const mongoose=require('mongoose')

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true,
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true,
            },
            price:{
                type:Number,
                default:0,
            },
            quantity:{
                type:Number,
                require:true,
                min:1,
               
            },
        },
    ],
    totalPrice:{
        type: Number,
        default:0
    },
})

module.exports=mongoose.model('Cart',cartSchema)