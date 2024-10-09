const Order=require('../models/orders')
const Cart=require('../models/cart')
const Category=require('../models/category')
const Brand=require('../models/brand')
const Product=require('../models/porduct')
const Address=require('../models/address')
const { use } = require('bcrypt/promises')
const User=require('../models/userModels')





// ------------------------------------ IN USER SIDE ----------------------------------------------



// load checkoup page  from user side
const getCheckOut=async (req,res)=>{
    try{

      const  userId=req.session.user._id
        const cartProduct=await Cart.findOne({userId:userId}).populate('items.product') 
        
        
        if(cartProduct){
        if(cartProduct.items.length !== 0 ){
            if(cartProduct.totalPrice !=0){
        const category=await Category.find({isListed:true})
        const brand=await Brand.find({isListed:true})
        const address=await Address.findOne({userId:userId})
        // console.log(address);
        
        res.render('checkOut',{category:category,brand:brand,cart:cartProduct,address:address||{ addressData: [] },userId})
    }else{
        req.flash('fail','update cart')
        res.redirect('/cart')
    }
    }else{
        req.flash('fail','Your Cart is Empty')
        res.redirect('/cart')
    }
}else{
    req.flash('fail','Your Cart is Empty')
    res.redirect('/cart')
}
    }catch(error){
        console.log(error.message);
        
    }
}


// place the order from the check out page 
 
const placeOrder=async (req,res)=>{
    try{
        
      const  userId=req.session.user._id

       const {payment_option, address}=req.body;
       console.log(address);
       
       const user =await User.findOne({_id:userId})
       const shippingAddress=await Address.findOne({"addressData._id":address},{ "addressData.$": 1 } )
       console.log("ddfdfd"+shippingAddress);
       
       const cartItems = await Cart.findOne({userId:userId})
        const order =new Order({
            userId:userId,
            items:cartItems.items.map((item)=>({
                product:item.product._id,
                price:item.price,
                quantity:item.quantity

            })),
            totalPrice:cartItems.totalPrice,
            billingDetails:{
                name:user.name,
                email: user.email,
                phno: user.phone,
                address:shippingAddress.addressData[0].address,
                secPnoe: shippingAddress.addressData[0].secphone,
                pincode: shippingAddress.addressData[0].pincode,
                country: shippingAddress.addressData[0].country,
                state: shippingAddress.addressData[0].state,
                city: shippingAddress.addressData[0].city,
              },
              paymentMethod:payment_option,
              paymentStatus:'pending',
              status:'Pending'
        
            });

            await order.save()
            
            
            for(let item of cartItems.items){
                await Product.findByIdAndUpdate(item.product._id,{
                    $inc:{stock:-item.quantity}
                })
            }

            await Cart.findOneAndDelete({ userId });
            res.json({ success: true, redirectUrl: `/confirmorder?orderId=${order._id}` });
        

    }catch(error){
        console.log(error.messagea);
        
    }
}


// const placeOrder = async (req, res) => {
//     try {
//         const { payment_option, address } = req.body;
//         const userId = req.session.user._id;
//         console.log(req.body);
        

//         // Process the order logic here
//         // ...

//         // Instead of redirecting, send a JSON response with the redirect URL
//         res.json({ success: true, redirectUrl: '/confirmorder' });
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json({ success: false, message: "Failed to place order" });
//     }
// };



// get confirmorder page
const confirmOrder=async (req,res)=>{
    try{
        const orderId=req.query.orderId
        
        const orderData=await Order.findOne({_id:orderId}).populate('userId') 
        console.log("dfererge"+orderData);
        
        res.render('confirmOrder',{order:orderData})

    }catch(error){
        console.log(error.message);
        
    }
} 



module.exports={
    getCheckOut,
    placeOrder,
    confirmOrder
}