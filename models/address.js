const mongoose=require('mongoose')

const addressSchema=new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        addressData:[
            {
                address:{
                    type: String,
                },
                pincode:{
                    type: String,
                },
                state:{
                    type: String,
                },
                city:{
                    type: String,
                },
                country:{
                    type: String,
                },
                secphone:{
                    type:String,
                },
                isDefault:{
                    type: String,
                    default: false,
                },
            },
        ],
    })

    module.exports=mongoose.model("Address",addressSchema)