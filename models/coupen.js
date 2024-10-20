const mongoose =require("mongoose")

const coupenSchema=new mongoose.Schema({
    coupenCode:{
        type:String,
        unique:true,
    },
    description:{
        type:String

    },
    discountPercentage:{
        type:String,
        min:0,
        max:100,
    },
    expiryDate:{
        type:Date
    },
    usedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    usedCount: {
        type: Number,
        default: 0,
      },
    minAmountPurchase:{
        type:Number,
        requir:true
    }

})

module.exports=mongoose.model('Coupen',coupenSchema)