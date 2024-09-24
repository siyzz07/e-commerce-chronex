const mongoose=require('mongoose');
const category = require('./category');

const productSchema= new mongoose.Schema({

    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    color:{
        type: String,
        required: true
    },
    brandName:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Brand",
        required: true
    },
   
    price:{
        type:Number,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Catetgory',
        required:true
    },
    images:{
        type:Array,
    },
    inWishlist:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:true
    },
    stock:{
        type:Number,
        required:true
    }
  
})

module.exports=mongoose.model("Product",productSchema)