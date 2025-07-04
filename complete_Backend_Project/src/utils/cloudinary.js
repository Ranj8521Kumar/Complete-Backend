import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // <-- fix here
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        // upload the file on cluodinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        //file has been uploaded successfully
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath);//delete uploaded file from local

        return response;
    } catch (error){
        fs.unlinkSync(localFilePath); //remove the localy saved temporary file as the upload operation got failed
        return null;
    }
}

const deletefromCloudinary = async (oldAvatar) => {
    try {
        if(!oldAvatar) return null;

        //get the public id from the url
        const publicId = oldAvatar.split('/').pop().split('.')[0];

        //delete the file from clodinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        });
    }catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        return null;
    }

    return response;
}

export {uploadOnCloudinary, deletefromCloudinary};