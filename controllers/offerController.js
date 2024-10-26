const Offer=require('../models/offer')
const Category=require('../models/category')
const Product=require('../models/porduct')






// get offer page list 

const offer = async (req, res) => {
    try {
        const perPage = 6; 
        const currentPage = parseInt(req.query.page) || 1;

        const offerCount = await Offer.countDocuments();
        const offer = await Offer.find()
            .populate('applicableProducts')
            .populate('applicableCategories')
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        // Updating expired offers
        const currentDate = new Date();
        for (const offers of offer) { 
            if (offers.endDate < currentDate) {
                offers.isEnded = true;
                offers.isListed = false;
                await offers.save(); 
            }
        }

        const msg = req.flash('msg');
        const fail = req.flash('fail');

        res.render('offer', {
            offer,
            fail,
            msg,
            currentPage,
            totalPages: Math.ceil(offerCount / perPage),
        });
    } catch (error) {
        console.log(error.message);
    }
};







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
            req.flash('fail','The offer is Aleady Added')
            res.redirect('/admin/offer')

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

            req.flash('msg','Offer Added')
            res.redirect('/admin/offer')

        }
        
    }catch(error){
        console.log(error.message);
        
    }
}


// edit offer get

const editOfferGet=async (req,res)=>{
    try{
         const offerId =req.query.id
       if(!offerId){
        res.redirect('/admin/offer')
       }else{
        
         const offer=await Offer.findOne({_id:offerId})
        const products=await Product.find({isPublished:true})
        const categories=await Category.find({isListed:true})

        res.render('editOffer',{products,categories,offer})
    }
    }catch(error){
        console.log(error.message);
        
    }
}


// edit offer
const editOffer=async (req,res)=>{

    try{

        const offerId = req.params.id;
        const existOffer = await Offer.findOne({
            offerName: req.body.offerName,
            _id: { $ne: offerId }
        });
        
        if(existOffer){
          
            req.flash('fail','Offer Already Exist')
            res.redirect('/admin/offer')
        }else{
            
        const updatedOffer = {
            offerName: req.body.offerName,
            offerType: req.body.offerType,
            discountPercentage: req.body.discountPercentage,
            endDate: req.body.endDate,
            applicableProducts: req.body.applicableProducts,
            applicableCategories: req.body.applicableCategories
        };

       
        await Offer.findByIdAndUpdate(offerId, updatedOffer);

        req.flash('msg','Offer Updated')
        res.redirect('/admin/offer')
    }

    }catch(error){
        console.log(error.message);
        
    }

}


// unlist offer

const unlistOffer=async (req,res)=>{
    try{
       const offerId = req.query.id
        const unslistoffer = await Offer.findByIdAndUpdate(offerId, { isListed: false });
        res.redirect('/admin/offer')
    }catch(error){
        console.log(error.message);
        
    }
}


// unlist offer

const listOffer=async (req,res)=>{
    try{
       const offerId = req.query.id
        const unslistoffer = await Offer.findByIdAndUpdate(offerId, { isListed: true});
        res.redirect('/admin/offer')
    }catch(error){
        console.log(error.message);
        
    }
}


module.exports={
    offer,
    addOffer,
    postAddOffer,
    editOfferGet,
    editOffer,
    unlistOffer,
    listOffer
}