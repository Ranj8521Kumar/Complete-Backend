import {asyncHandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/Apierror.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiRespose.js";

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    const {fullName, email, userName, password } = req.body;
    console.log("email: ", email);

    // validation - not empty
    // if(fullName  === ""){
    //     throw new ApiError(400, "fullName is required");
    // }

    if(
        [fullName, email, userName, password].some((field) => 
            field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exist: username, email
    const existedUser = await User.findOne({
        $or: [{userName},{email}]
    });

    if(existedUser){
        throw new ApiError(409, "User with email or username already exist");
    };

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path; //may be missing so add optional chaining

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    };

    console.log(avatarLocalPath);

    // upload them to cloudinary, avatar check at coudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatar);
    console.log(coverImage);


    if(!avatar){
        throw new ApiError(400, "avatar file is required");
    }

    // create user object - create entry in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // check for user creation
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while entering the user");
    };

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );
});

export {registerUser};