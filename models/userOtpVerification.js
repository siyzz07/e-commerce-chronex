const mongoose=require("mongoose")

const userOtpSchema = new mongoose.Schema({
    userId:String,
    otp:String,
    otpexpire:Date, 
})

module.exports=mongoose.model("userOtp",userOtpSchema)