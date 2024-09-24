 const mongoose=require('mongoose')


 const categorySchema=new mongoose.Schema({


category:{
    type:String,
    require:true
},
description:{
    type:String,
    require:true
},
isListed:{
    type:Boolean,
    default:true

}


 })

 module.exports=mongoose.model("Catetgory",categorySchema)