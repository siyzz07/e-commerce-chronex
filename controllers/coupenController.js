const coupen = require('../models/coupen')
const Coupen=require('../models/coupen')



//----------------------------------------------- ADMIN -----------------------------------------------------------------

// get coupen getPage 
const getCoupenPage=async (req,res)=>{
    try{

        const coupen=await Coupen.find()
        const msg=req.flash('msg')
        const fail=req.flash('fail')
        res.render('coupen',{fail,coupen,msg})
    }catch(error){
        console.log(error.message);
        
    }
}


// addcoupen get 

const getAddCoupen=async (req,res)=>{
    try{
        res.render('addCoupen')
    }catch(error){
        console.log(error.message);
        
    }
}


// post the details from the add coupen page 
const postAddCoupen=async (req,res)=>{
    try{
     const {code,description,discount,min,max,date}=req.body
        




    
     let coupen= await Coupen.findOne({ coupenCode:code})
     if(!coupen){
        coupen=new Coupen({
            coupenCode:code,
            description:description,
            discountPercentage:discount,
            expiryDate:date,
            minAmountPurchase:min 
            

        })

        await coupen.save()

        req.flash('msg','Coupen added Succesfuly')
        res.redirect('/admin/coupen')
     }else{
        req.flash('fail','Coupen is alredy added')
        res.redirect('/admin/coupen')
     }


    }catch(error){
        console.log(error.message);
        
    }
}


// delete coupen
const deleteCoupen=async(req,res)=>{
    try{

       const coupenId=req.query.id
        const coupen=await Coupen.findByIdAndDelete({_id:coupenId})
        req.flash('msg',"Coupen deleted successfully")
        res.redirect('/admin/coupen')

    }catch(error){
        console.log(error.message);
        
    }
}


//----------------------------------------------- END -------------------------------------------------------------------- 
//----------------------------------------------------- USER ---------------------------------------------------------------

// in chek out page the modal the availabel coupen for that usershow  in the modal that code  writen in  ordercontroller ( load checkoup page  from user side)





module.exports={

// -----admin------   
    getCoupenPage,
    getAddCoupen,
    postAddCoupen,
    deleteCoupen
// -----end---------
// -----user--------

}