// require('dotenv').config({path: './env'});
// require('dotenv').config();
import dotenv from 'dotenv'; //in package.json under scripts include like this for use import dotenv: "nodemon -r dotenv/config --experimental-json-modules src/index.js",

import connectDB from './db/index.js';

import { app } from './app.js'

dotenv.config({
    path: './env'
})

connectDB() //async return a promise
.then( ()=>{
    app.on("Error", (error) => {
        console.log("Error: ", error);
        throw error;
    });

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MongoDB connection Failed !!! ", error);
})















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
