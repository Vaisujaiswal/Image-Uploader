import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import multer from "multer";
import path from "path"

const app = express();
const port = process.env.PORT;

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

mongoose.connect(process.env.MONGO_URL, {
    dbName: "Image_Uploader"
}).then(()=>console.log("MongoDB connected")).catch((err) => console.log(err));

app.get("/", (req,res) => {
    res.render("index.ejs", {Url:null})
})

const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + path.extname(file.originalname)
      cb(null, file.fieldname + "-" + uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage })

const ImageSchema = new mongoose.Schema({
    filename: String,
    public_id: String,
    imageUrl: String
})

const File = mongoose.model("cloudinary", ImageSchema)

app.post('/upload', upload.single('file'), async(req, res) => {
    const file = req.file.path;
    const cloudinaryRes = await cloudinary.uploader.upload(file,{
        folder: "Image_Uploder_Project"
    })
    const db = await File.create({
        filename: file.originalname,
        public_id: cloudinaryRes.public_id,
        imageUrl: cloudinaryRes.secure_url
    })

    res.render("index.ejs", {Url: cloudinaryRes.secure_url})

    // res.json({messge: "Uploaded file", cloudinaryRes})
  })

app.listen(port, () => console.log(`App is listing at ${port}`));