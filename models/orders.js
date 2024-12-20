  const mongoose=require('mongoose')

  const orderSchema =new mongoose.Schema({
      userId:{
          type:mongoose.Schema.Types.ObjectId ,
          ref:'User',
          required:true
      },items:[
          {
              product:{
                  type:mongoose.Schema.Types.ObjectId,
                  ref:"Product"
              },
              price:{
                  type:Number,
                  default:0
              },
              quantity:{
                  type:Number
              },
          },
      ],
      totalPrice:{
          type:Number,
          default:0,
      },
      discount:{
        type:Number
      },
      totalWithDiscount:{
        type:Number
      },

      status:{
          type:String,
          enum:["Pending", "Shipped", "Delivered", "Cancelled", "Returned"],
          default:'pending'
      },
      billingDetails: {
          name: String,
          email: String,
          phno: String,
          address: String,
          pincode: String,
          country: String,
          state: String,
          city: String,
          secPhone:String
        },
        paymentMethod: {
          type: String,
        },
        paymentStatus: {
          type: String,
          default: "COD",
        },
        returnReason: {
          type: String,
        },
        orderDate: {
          type: Date,
          default: Date.now(),
        },
        
  })
  module.exports = mongoose.model("Order", orderSchema )