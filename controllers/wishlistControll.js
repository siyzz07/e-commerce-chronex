const Wishlist=require('../models/wishlist')
const Category = require("../models/category");
const Brand = require("../models/brand");




// ------------------------------------------ USER ------------------------------------------------------------


// add product to wishlist --afeter clilcking the heart button form the product details page 
const addWishlist=async (req,res)=>{
    try{
        
     const userId=req.session.user._id
        console.log("1zz"+userId);
        
      const productId=req.query.id;

    console.log("2zzz"+productId);
    
        

        let wishlist=await Wishlist.findOne({userId:userId})
        console.log("3zzz"+wishlist);
        

        if(!wishlist){

            wishlist=new Wishlist({
                userId:userId,

                items:[
                    {
                      product:productId,  
                    }
                ]
            })
        }else{
            const existwishlist=await Wishlist.findOne({userId:userId,'items.product':productId})
            
            
            if(existwishlist){
                req.flash('fail','product already added')
                return res.redirect(`/productdetails?id=${productId}`)
            }

            wishlist.items.push({
                product:productId
            })
        }

        await wishlist.save()
        req.flash('msg','product added to wishlist')
        res.redirect(`/productdetails?id=${productId}`)



    }catch(error){
        console.log(error.message);
    }
}






// get wishlist page 
const getWishlist=async (req,res)=>{
    try{
    
        const userId=req.session.user._id
        
        
        const category=await Category.find({isListed:true})
        const brand=await Brand.find({isListed:true})
        const wishlist=await Wishlist.findOne({userId:userId}).populate('items.product')
        const fail=req.flash('fail')
        const msg=req.flash('msg')
        
        res.render('wishlist',{category:category,brand:brand ,product:wishlist||{items:[]},fail,msg})
    }catch(error){
        console.log(error.message);
        
    }
}




const deleFromWishlist=async (req,res)=>{
    try{
        const userId=req.session.user._id
     
        const productId=req.query.id
       
        const deletproduct=await Wishlist.updateOne({userId},{$pull:{items:{product:productId}}})
        if(deletproduct.modifiedCount !== 0){
            req.flash('msg','product deleted')
            res.redirect('/wishlist')
        }else{
            req.flash('fail','delet falied ')
            res.redirect('/wishlist')
        }

    }catch(error){
        console.log(error.message);
        
    }
}


// ------------------------------------------ END ------------------------------------------------------------




module.exports={
    getWishlist,
    addWishlist,
    deleFromWishlist
}