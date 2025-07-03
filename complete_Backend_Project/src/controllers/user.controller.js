import {asyncHandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/Apierror.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary, deletefromCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiRespose.js";
import jwt from "jsonwebtoken";
import { runInNewContext } from "vm";

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };
    }catch(error){
        throw new ApiError(500, "Something went wrong while generating the refresh and access token");
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    const {email, userName, password} = req.body;

    console.log(email);

    // userName or email
    if(!(userName || email)){
        throw new ApiError(400, "username or email is required");
    };

    // find the user
    const user = await User.findOne({
        $or: [
            {
                userName,
            },
            {
                email,
            }
        ]
    });

    if(!user){
        throw new ApiError(404, "User not exit");
    };
    
    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }

    // access and refesh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    // send cookie
    const loggedInUser = await User.findById(user._id).select("-Password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user Logged in successfully"
        )
    )
});

const logOutUser = asyncHandler(async  (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true //for returning the new updated value
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged Out"));
});

const refreshAcessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body;

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorised request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Acess token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Error refreshed token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} =  req.body;

    const user = await User.findById(req.user._id);

    const isCorrectPassword = await user.isPasswordCorrect(oldPassword);

    if(!isCorrectPassword){
        throw new ApiError(401, "Invalid old Password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, re) => {
    return res.status(200)
    .json(200, req.user, "Current User fetched Successfully");
});

const updateAccountUser = asyncHandler(async (req, res)=> {
    const {fullName, email} = req.body;

    if(!(fullName && email)){
        throw new ApiError(400, "All fiels are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, // fullName: fullName
                email
            }
        },
        {new: true}
    ).select("-password refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, "Account Details Update Successfully"));

});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);


    if(!avatar.url){
        new ApiError(400, "Error while uploading avatar");
    }

    if(!req.user?._id){
        throw new ApiError(401, "User not authenticated");
    }

    const user = await User.findById(req.user._id);
    const oldAvatar = user?.avatar;

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    
    //delete old avatar from clodinary
    if(oldAvatar){
        const response = await deletefromCloudinary(oldAvatar);
    }else{
        throw new ApiError(400, "Old avatar not found");
    }

    res.
    status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar Updated Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        new ApiError(400, "coverImage file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        new ApiError(400, "Error while uploading coverImage");
    }

    // get user and old coverImage
    const user = await User.findById(req.user._id);
    const oldCoverImage = user?.coverImage;

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    // delete old coverImage from clodinary
    if(oldCoverImage){
        const response = await deletefromCloudinary(oldCoverImage);
    }else{
        throw new ApiError(400, "Old coverImage not found");
    }

    res.
    status(200)
    .json(new ApiResponse(200, user, "CoverImage Updated Successfully"));
});

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAcessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountUser,
    updateUserAvatar,
    updateUserCoverImage,
};