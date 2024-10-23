const mongoose=require('mongoose')

const offerSchema=new mongoose.Schema({
    offerName:{
        type:String
    },
    offerType: {
        type:String,
        required:true,
        enum:["product", "category"]
    },
    discountPercentage:{
        type:Number
    },
    startDate:{
        type:Date
    },
    endDate:{
        type:Date
    },
    applicableProducts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
        }
    ],
    applicableCategories:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Catetgory",
        }
    ],
    isListed: {
        type: Boolean,
        default: true,
      },
},
{ timestamps: true }
);


module.exports=mongoose.model("Offer",offerSchema)