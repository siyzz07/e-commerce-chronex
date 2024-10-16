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

       const user =await User.findOne({_id:userId})
       const shippingAddress=await Address.findOne({"addressData._id":address},{ "addressData.$": 1 } )

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




// get confirmorder page
const confirmOrder=async (req,res)=>{
    try{
        const orderId=req.query.orderId
        if(orderId){
            const orderData=await Order.findOne({_id:orderId}).populate('userId') 
            res.render('confirmOrder',{order:orderData})
        }else{
            res.redirect('/home')
        }
       

    }catch(error){
        console.log(error.message);
        
    }
} 



// order history
const getOrderHistory=async (req,res)=>{
    try{
        const id =req.session.user._id
       
        
        if(!id){
            return res.redirect('/home')
        }
        const order=await Order.find({userId:id}).populate({
            path:'items.product',
            model:'Product'
        })
        const category=await Category.find({isListed:true})
        const brand=await Brand.find({isListed:true})
        res.render('orderHistory',{category:category,brand:brand,orders:order})

    }catch(error){
        console.log(error.message);
        
    }
}


// user can see the order details  ,from history page

const getOrderDeatails=async (req,res)=>{
    try{
        const orderId=req.query.orderid
        if(!orderId){
            res.redirect('/order')
        }
       const userId=req.session.user._id
        const orderData=await Order.findOne({_id:orderId}).populate({
            path:'items.product',
            model:'Product'
        })
        
        
        const user=await User.findOne({_id:req.session.user._id})
        const category=await Category.find({isListed:true})
        const brand=await Brand.find({isListed:true})
        res.render('ordreDetails',{category:category,brand:brand,order:orderData,user:user})
    }catch(error){
        console.log(error.message);
        
    }
}

// cancel the order form the order page
const cancelOrder=async (req,res)=>{
    try{
      const  orderId=req.query.orderid
      const order=await Order.findOne({_id:orderId})
      for(let item of order.items){
        await Product.findByIdAndUpdate(item.product._id,{
            $inc:{stock: item.quantity}
          })
       }
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' });
        res.redirect('/order')


    }catch(error){
        console.log(error.message);
        
    }
}


const retrunProduct=async (req,res)=>{
    try{


        const  orderId=req.query.orderid
        
        const  reason=req.body.reason
        
        const order=await Order.findOne({_id:orderId})
        for(let item of order.items){
        await Product.findByIdAndUpdate(item.product._id,{
            $inc:{stock: item.quantity}

          })
       }
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'Returned', returnReason:reason });


        res.redirect('/order')



    }catch(error){
        console.log(error.message)
    }
}



//--------------------------------------------------- END ------------------------------------------------------
//---------------------------------------------------------- ADMIN SIDE ------------------------------------------------


//get order Lits page
const getOrderList=async (req,res) =>{
    try{
        
        const order=await Order.find()
         const msg=req.flash('msg')
        res.render('orderManagement',{order:order,msg})

    }catch(error){
        console.log(error.message);
        
    }
}


//get order details after click details button from the order list page

const orderDeatails=async (req,res)=>{
    try{
        const orderId=req.query.id
        if(orderId){
        const orderData=await Order.findOne({_id:orderId}).populate({
            path:'items.product',
            model:'Product'
        })
        const orderStatus=orderData.status
        res.render('orderUpdate',{order:orderData,orderStatus})
    }else{
        res.redirect('/admin/orderList')
    }
    }catch(error){
        console.log(error.message);
        
    }
}


// order update

const orderUpdate=async (req,res)=>{
    try{
      const  orderId=req.query.id
    //   console.log(orderId);
      
    //   console.log(req.body);
      const {choice}=req.body
    //   console.log(choice);
      
      
        if(orderId){
            const updatOrder=await Order.findByIdAndUpdate(orderId,{status:choice})
            req.flash('msg','order status updated')
            res.redirect('/admin/orderList')
        }else{
            res.redirect('/admin/orderList')
        }

    }catch(error){
        console.log(error.message);
        
    }
}

module.exports={
    getCheckOut,
    placeOrder,
    confirmOrder,
    getOrderHistory,
    getOrderDeatails,
    cancelOrder,
    retrunProduct,
    // ---end----
    //---admin----  
    getOrderList,
    orderDeatails,
    orderUpdate
}