    const express=require('express')
    const session = require('express-session');
        const app=express()
    require('dotenv').config();
    
    const passport = require('passport');
    require('./config/passportConfig')


        const methodOverride = require('method-override');
        // Middleware to handle PUT and DELETE methods from forms
        app.use(methodOverride('_method'));

    const mongoose = require("mongoose");

    mongoose
        .connect(process.env.DATABASE_URL)
        .then(()=>console.log("connected to database"))
        .catch((err)=>console.log("could not connect database",err.message))


    const multer=require('multer')
    const path=require('path')

    app.set("view engine","ejs");
    app.set("views","./views/users") 
        
        app.use(express.static("public/images"))
        app.use(express.static("public"))
        app.use(express.static('public/users'))
        app.use('/public', express.static('public'));
        
        
    const nocache=require('nocache');
        app.use(nocache())

    const flash=require('connect-flash')
        app.use(flash());




        //for using user routes
    const userRoute=require("./routes/userRout")
    app.use("/",userRoute)


    //for usin admin route
    const adminRoute=require('./routes/adminRout')
    app.use('/admin',adminRoute)




 // 404 for User Routes
app.use("/", (req, res) => {

    res.status(404).render("404");
});



    // -------------google auth----------

    // app.use(session({
    //     secret: 'your_secret_key',
    //     resave: false,
    //     saveUninitialized: false,
    //   }));

    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());


    const PORT=process.env.PORT || 5000


    app.listen(PORT,()=>console.log(`server in running on port ${PORT}`))



