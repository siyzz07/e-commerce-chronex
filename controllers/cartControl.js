const Cart=require('../models/cart')
const Category=require('../models/category')
const Brand=require('../models/brand')
const Product=require('../models/porduct')
const { productDetails } = require('./userControl')



//add product to cart from product details  page click add to cart
    const addToCart=async (req,res)=>{
        try{
        const  productId=req.query.id;
        const  userId=req.session.user._id
            const procuct = await Product.findOne({_id:productId})
            const price=procuct.price
            // console.log(procuct);
            
            let cart=await Cart.findOne({userId:userId})
            if(!cart){
                cart=new Cart({
                    userId:userId,

                    items:[
                        {
                        product:productId,
                        price:price,
                        quantity:1
                        }
                    ]

                })
            }else{
                const existCart=await Cart.findOne({userId:userId,'items.product':productId})
            
                if(existCart){
                    req.flash('fail','product already added')
                    return res.redirect(`/productdetails?id=${productId}`)
                }
                cart.items.push({
                    product:productId,
                    price:price,
                    quantity:1
                })
            }
            await cart.save()
            req.flash('msg','product added to cart')
            res.redirect(`/productdetails?id=${productId}`)
            
        }catch(error){
            console.log(error.message);
            
        }
    }







//add product to cart from product wishlist page click add to cart
const addToCartFromWishlist=async (req,res)=>{
    try{
    const  productId=req.query.id;
    const  userId=req.session.user._id
        const procuct = await Product.findOne({_id:productId})
        const price=procuct.price
        // console.log(procuct);
        
        let cart=await Cart.findOne({userId:userId})
        if(!cart){
            cart=new Cart({
                userId:userId,

                items:[
                    {
                    product:productId,
                    price:price,
                    quantity:1
                    }
                ]

            })
        }else{
            const existCart=await Cart.findOne({userId:userId,'items.product':productId})
        
            if(existCart){
                req.flash('fail','product already added')
                return res.redirect(`/wishlist`)
            }
            cart.items.push({
                product:productId,
                price:price,
                quantity:1
            })
        }
        await cart.save()
        req.flash('msg','product added to cart')
        res.redirect(`/wishlist`)
        
    }catch(error){
        console.log(error.message);
        
    }
}







// get cart page and sees the cart total 
const getCart =async (req,res)=>{
    try{
        userId=req.session.user._id
        const category=await Category.find({isListed:true})
        const brand=await Brand.find({isListed:true})
        const cartData=await Cart.findOne({userId:userId}).populate('items.product')
        const msg=req.flash('msg')
        const fail=req.flash('fail')
    
        
        res.render('cart',{category:category,brand:brand,cartData:cartData||{ items: [] },msg,fail})
    }catch(error){
        console.log(error.message);
        
    }
} 


// update cart 

const updateCart=async (req,res)=>{
    try{

        const { items } = req.body;         
        const userid=req.session.user._id;
      
        // console.log(userid);
        // console.log(items);
        
        const totalPrice=items.reduce((total,item)=>total+ parseInt(item.subtotal),0)
        // console.log(totalPrice);
        
        items.forEach(async item => {
            const { productId, quantity, subtotal } = item;
            
            let update=await Cart.updateOne(
                {userId:userid,'items.product':productId},
                {
                    $set:{
                        'items.$.price':subtotal,
                        'items.$.quantity':quantity
                        
                    }
                }
            )
        });
        
        const cartItem=await Cart.updateOne({userId:userid},{totalPrice:totalPrice})
       
    
    }catch(error){
        console.log(error.message);
        
    }
}


// delete the product form the cart

const deleFromCart=async (req,res)=>{
    try{
        const userId=req.session.user._id
        const productId=req.query.id
        // console.log(productId);
        
        const deletproduct=await Cart.updateOne({userId},{$pull:{items:{product:productId}}})
        if(deletproduct.modifiedCount !== 0){
            req.flash('msg','product deleted')
            res.redirect('/cart')
        }else{
            req.flash('fail','delet falied ')
            res.redirect('/cart')
        }

    }catch(error){
        console.log(error.message);
        
    }
}


// load checkoup page
// const getCheckOut=async (req,res)=>{
//     try{
//         const cartProduct=await Cart.findOne({userId:userId}).populate('items.product')
//         const category=await Category.find({isListed:true})
//         const brand=await Brand.find({isListed:true})
//         res.render('checkOut',{category:category,brand:brand,cart:cartProduct})
//     }catch(error){
//         console.log(error.message);
        
//     }
// }

module.exports={
    getCart,
    addToCart,
    updateCart,
    deleFromCart,
    // getCheckOut
    addToCartFromWishlist
}