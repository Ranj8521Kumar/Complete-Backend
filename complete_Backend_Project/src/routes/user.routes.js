import {Router} from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logOutUser, refreshAcessToken, registerUser, updateAccountUser, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(
    verifyJwt,
    logOutUser
);

router.route("/refresh-token").post(refreshAcessToken);

router.route("/change-password").post(verifyJwt, changeCurrentPassword);

router.route("/current-user").get(verifyJwt, getCurrentUser);

router.route("/update-account").patch(verifyJwt, updateAccountUser);

router.route("/avatar").patch(verifyJwt, upload.single('avatar'), updateUserAvatar);

router.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:userName").get(verifyJwt, getUserChannelProfile);

router.route("/history").get(verifyJwt, getWatchHistory);

export default router;