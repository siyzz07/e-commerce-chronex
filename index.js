const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/chronex_ecommerce-week7");

const express=require('express')
const app=express()
const multer=require('multer')
const path=require('path')

const flash=require('connect-flash')
const nocache=require('nocache');

app.use(nocache())

app.use(express.static("public"))
app.use(express.static("public/images"))
app.use(express.static('public/users'))
app.use('/public', express.static('public'));



app.use(flash());

const port=5000





//for using user routs
const userRoute=require("./routes/userRout")
app.use("/",userRoute)



const adminRoute=require('./routes/adminRout')
app.use('/admin',adminRoute)
// console.log(adminRoute);
// console.log("1");

// app.use('/admin',adminRoute);


app.listen(port,()=>console.log(`server in running on port ${port}`))



