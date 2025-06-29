// require('dotenv').config({path: './env'});
// require('dotenv').config();
import dotenv from 'dotenv'; //in package.json under scripts include like this for use import dotenv: "nodemon -r dotenv/config --experimental-json-modules src/index.js",

import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})

connectDB();















/*
import express from 'express';
const app = express();

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("Error", error);
            throw error;
        });

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on ${process.env.PORT}`);
        })
    } catch (error){
        console.error("Error: ", error);
    }
})()

*/
