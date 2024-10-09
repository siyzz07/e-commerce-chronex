const Address=require('../models/address')
const Product=require('../models/porduct')
const Category=require('../models/category')
const Brand=require('../models/brand')



// get address page
// const getAddress=async (req,res)=>{
//     try{
//         const userId=req.session.user._id
//         const userAddress=await Address.findOne({userId:req.session.user._id})
//       const category=await Category.find({isListed:true})
//        const brand=await Brand.find({isListed:true})
//        const msg=req.flash('msg')
//        const fail=req.flash('fail')
//       res.render('address',{category:category,brand:brand,msg,userAddress:userAddress,fail,userId})
//     }catch(error){
//       console.log(error.message);
      
//     }
//   }

// get address page
const getAddress = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const userAddress = await Address.findOne({ userId: req.session.user._id });
        const category = await Category.find({ isListed: true });
        const brand = await Brand.find({ isListed: true });
        const msg = req.flash('msg');
        const fail = req.flash('fail');

        
        res.render('address', {
            category: category,
            brand: brand,
            msg,
            userAddress: userAddress || { addressData: [] },  
            fail,
            userId
        });
    } catch (error) {
        console.log(error.message);
    }
};


//add address page get
const getAddAddress=async (req,res)=>{
    try{
        const id=req.query.id
        
        
        if(!id){
            res.redirect('/address')
        }else{
        
        const category=await Category.find({isListed:true})
        const brand=await Brand.find({isListed:true})
        res.render('addAddress',{category:category,brand:brand,})
    }
    }catch(error){
        console.log(error.message);
        
    }
}


// post addAddress
const postAddAddres=async (req,res)=>{
    try{
      const userid=req.session.user._id
        let newAddress=await Address.findOne({userId:userid})
        if(!newAddress){

            newAddress=new Address({
                userId:userid,

                addressData:[
                    {
                     address:req.body.address,
                     pincode :req.body.pincode,
                     state:req.body.state,
                     city:req.body.city ,
                     country:req.body.country,
                     secphone:req.body.sphone
                    }
                ]
            })
        }else{
            const addressExist=await Address.findOne({userId:userid,'addressData.address':req.body.address,'addressData.city':req.body.city })
          if(addressExist)  {
                req.flash('fail','Address is already added')
                  return  res.redirect('/address')
            }

            newAddress.addressData.push({
                address:req.body.address,
                pincode :req.body.pincode,
                state:req.body.state,
                city:req.body.city ,
                country:req.body.country,
                secphone:req.body.sphone
            })
        }
        await newAddress.save()
        req.flash('msg','address added auccessfully')
        res.redirect('/address')


    }catch(error){
        console.log(error.message);
        
    }
}


//delete address
const deletAddress=async (req,res)=>{
    try{
        const userid=req.session.user._id
        const addressid=req.query.id
        const deleAddress=await Address.updateOne({userId:userid},{$pull:{addressData:{_id:addressid}}})
        if (deleAddress.modifiedCount === 0) {
            req.flash('fail','cant find the address')
            res.redirect('/address')
          }else{
            req.flash('msg','Deleted Successfully')
            res.redirect('/address')
          }
      
          
    }catch(error){
        console.log(error.message);
        
    }
}


// edit address get page
const editAddress=async (req,res)=>{
    try{
        const addressid = req.query.addressid;
        console.log(addressid);
        
     
        const address = await Address.findOne(
          { 'addressData._id': addressid },  
        );
        
        console.log(address.addressData); // This will log the specific address object that matched
        
        
        const category=await Category.find({isListed:true})
        const brand=await Brand.find({isListed:true})
        res.render('editAddress',{category:category,brand:brand,address:address})
    }catch(error){
        console.log(error.message);
        
    }
}

module.exports={
    getAddAddress,
    postAddAddres,
    getAddress,
    deletAddress,
    editAddress

}