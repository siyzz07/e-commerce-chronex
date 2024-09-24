const mongoose=require('mongoose')


const brandSchema=new mongoose.Schema({
    brand:{
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

module.exports=mongoose.model("Brand",brandSchema)