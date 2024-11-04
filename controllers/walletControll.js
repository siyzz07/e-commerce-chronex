
const Wallet=require('../models/wallet')
const Category=require('../models/category')
const Brand=require('../models/brand')
const Transaction=require('../models/transaction')




// get Wallet page

const getWallet=async(req,res)=>{
    try{
            const userId=req.session.user._id

        const transaction=await Transaction.find({userId:userId}).sort({date:-1})
        const category=await Category.find({isListed:true})
        const brand=await Brand.find({isListed:true})

       let wallet=await Wallet.findOne({userId:userId}).populate('userId')

        if(!wallet){
            wallet =new Wallet({
                userId:userId,
                balace:0
            })
            await wallet.save()
        }

        
        res.render('wallet',{category:category,brand:brand ,wallet,transaction})
       
    }catch(error){
        console.log(error.message);
        
    }
}



module.exports={
    getWallet
}