// const mongoose=require('mongoose');
// const category = require('./category');

// const productSchema= new mongoose.Schema({

//     title:{
//         type: String,
//         required: true
//     },
//     description:{
//         type: String,
//         required: true
//     },
//     color:{
//         type: String,
//         required: true
//     },
//     brandName:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref:"Brand",
//         required: true
//     },
   
//     price:{
//         type:Number,
//         required:true
//     },
//     isPublished:{
//         type:Boolean,
//         default:true
//     },
//     category:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'Catetgory',
//         required:true
//     },
//     images:{
//         type:Array,
//     },
//     inWishlist:{
//         type:Boolean,
//         default:false
//     },
//     isBlocked:{
//         type:Boolean,
//         default:true
//     },
//     stock:{
//         type:Number,
//         required:true
//     },
//     offerPrice: {
//         type: Number,
//       },
//       offerPercentage: {
//         type: Number,
//       },
//       offerId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "offer",
//         default: null,
//       },
//       isDiscounted: {
//         type: Boolean,
//         default: false,
//       },
  
// })

// productSchema.pre("save", function (next) {
//     if (this.offerId) {
//        this.offerPrice = Math.floor(this.price - (this.price * this.offerPercentage / 100))
//     }else{
//       this.offerPrice=0
//     }
//     next();
//   });


// module.exports=mongoose.model("Product",productSchema)



const mongoose = require('mongoose');
const category = require('./category');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  brandName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catetgory',
    required: true,
  },
  images: {
    type: Array,
  },
  inWishlist: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  offerPrice: {
    type: Number,
    default: 0, 
  },
  offerPercentage: {
    type: Number,
    default:0,
  },
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'offer',
    default: null,
  },
  isDiscounted: {
    type: Boolean,
    default: false,
  },
});



module.exports = mongoose.model('Product', productSchema);
