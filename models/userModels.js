const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },

    email:{
        type:String,
        require:true
    },
    phone:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },


    otp:{
        type:String,
        requires:true
    },

    otpexpire:{
        type:Date,
        requires:true
    },

    isVerified:{
        type:Boolean,
        default:false
    },

    isBlocked:{
        type:Boolean,
        default:false
    },
    created:{
        type:Date,
        required:true,
        default:Date.now
    }
})

module.exports=mongoose.model('User',userSchema)