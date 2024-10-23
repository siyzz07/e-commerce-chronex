const Offer=require('../models/offer')
const Category=require('../models/category')
const Product=require('../models/porduct')






// get offer page list 

const offer=async (req,res)=>{
    try{

        const offer=await Offer.find().populate('applicableProducts').populate('applicableCategories')


        res.render('offer',{offer})
    }catch(error){
        console.log(error.message);
        
    }
}






// addin a new offer get 
const addOffer=async(req,res)=>{
    try{

        const products=await Product.find({isPublished:true})
        const categories=await Category.find({isListed:true})
      res.render('addOffer',{products,categories})
    }catch(error){
      console.log(error.message);
      
    }
  }


// new offer post form the add ofer page
const postAddOffer=async (req,res)=>{
    try{
        
        const offer=await Offer.findOne({offerName:req.body.offerName.toLowerCase()})

        if(offer){

        }else{

            const addoffer=new Offer({
                offerName :req.body.offerName,
                offerType:req.body.offerType,
                discountPercentage:req.body.discountPercentage,
                endDate:req.body.endDate,
                applicableProducts:req.body.applicableProducts,
                applicableCategories:req.body.applicableCategories

            })

            const offeradd=await addoffer.save();
            const percentage=offeradd.discountPercentage

            if(offeradd.offerType == 'product'){


                for (const product of offeradd.applicableProducts){
                    let productOffer=await Product.findById(product)

                 if(productOffer){ 
                    productOffer.isDiscounted = true;
                    productOffer.offerId = offeradd._id;
                    productOffer.offerPercentage = percentage;
                    await productOffer.save();
                 }
                }
            }else{
                for (const category of offeradd.applicableCategories){
                    let categoryproducts=await Product.find({category})
                    for (const productOffer of categoryproducts) {
                        productOffer.isDiscounted = true;
                        productOffer.offerId = offeradd._id;
                        productOffer.offerPercentage = percentage;
                        await productOffer.save();
                      }
                    

                }
            }

        }
        
    }catch(error){
        console.log(error.message);
        
    }
}




module.exports={
    offer,
    addOffer,
    postAddOffer
}