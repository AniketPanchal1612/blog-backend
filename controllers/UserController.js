const generateToken = require('../config/generateToken.js');
const sgMail = require('@sendgrid/mail')
const UserModel = require('./../model/user/UserModel.js');
const asyncHandler = require('express-async-handler');
const ValidateId = require('../utils/ValidateMongoDbId.js');
const cloudinaryUploadImage = require('../utils/cloudinary.js');
const fs = require('fs');
const blockUser = require('../utils/blockUser.js');

// sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
// const registerUser =(req,res)=>{
//     res.status(201).json({user:"User registered"})

// }
// module.exports = {registerUser}


exports.registerUser = asyncHandler(async (req, res) => {
    // check if user exists

    const userExist = await UserModel.findOne({ email: req?.body?.email })
    if (userExist) {
        throw new Error('User already registered');
        // res.status(501).json({message: `${userExist.email} already registered`})
    }
    try {
        // const {lastName, email, password} = req.body;
        const user = await UserModel.create({
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            password: req?.body?.password
        });
        res.status(201).json(user)
    } catch (error) {
        if (!res.headerSent) {

            res.status(501).json(error)
        }
    }
})



//Login User
exports.loginUser = asyncHandler(async (req, res) => {
    //check user exist or not
    const { email, password } = req.body;

    if (!email || !password) {
        throw new Error('Pleas enter email or password');
    }
    const userFound = await UserModel.findOne({ email });
    if (!userFound) {
        throw new Error(`User not found with ${email}`);
    }
    //check if password is correct or not
    if (userFound && await userFound.isPasswordMatch(password)) {
        res.json({
            id: userFound?._id,
            firstName: userFound?.firstName,
            lastName: userFound?.lastName,
            email: userFound?.email,
            profilePhoto: userFound?.profilePhoto,
            isAdmin: userFound?.isAdmin,
            token: generateToken(userFound._id)
        })
    }
    else {
        res.status(401)
        throw new Error('Invalid credentials')
    }
    res.json(user)
})

exports.allUsers = asyncHandler(async (req, res) => {
    try {
        const users = await UserModel.find({});
        const userCount = await UserModel.count();
        res.json(users )
    } catch (error) {
        res.json(error)
    }
})


exports.deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    //check id is correct or not
    ValidateId(id)
    try {
        const user = await UserModel.findByIdAndDelete(id);
        res.json(user)
    } catch (error) {
        res.json(error)
    }
})


exports.getSingleUser = asyncHandler(async (req, res) => {
    // console.log(req.headers) 
    const { id } = req.params
    ValidateId(id)
    try {
        const user = await UserModel.findById(id)
        res.json(user)
    } catch (error) {
        res.json(error)
    }
})


//User Profile for logged in user
exports.getUserProfile = asyncHandler(async (req, res) => {
    const { id } = req.params
    ValidateId(id)
    // try {
    //     //myprofile
    //     const user = await UserModel.findById(id).populate('posts')
    //     res.json(user)

    // } catch (error) {
    //     res.json(error)
    // }
    //1.Find the login user
    //2. Check this particular if the login user exists in the array of viewedBy

    //Get the login user
    const loginUserId = req?.user?._id?.toString();
    // console.log(typeof loginUserId);
    try {
        const myProfile = await UserModel.findById(id)
            .populate("posts")
            .populate("viewedBy");
        const alreadyViewed = myProfile?.viewedBy?.find(user => {
            // console.log(user);
            return user?._id?.toString() === loginUserId;
        });
        if (alreadyViewed || (loginUserId===id)) {
            res.json(myProfile);
        } else {
            const profile = await UserModel.findByIdAndUpdate(myProfile?._id, {
                $push: { viewedBy: loginUserId },
            });
            res.json(profile);
        }
    } catch (error) {
        res.json(error);
    }
})



//update profile
exports.updateProfile = asyncHandler(async (req, res) => {
    const { _id } = req?.user;
    ValidateId(_id)
    const user = await UserModel.findByIdAndUpdate(_id, {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        bio: req?.body?.bio,

    },
        {
            new: true,
            runValidators: true,

        }
    );
    res.json(user)

})


exports.updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { password } = req.body
    ValidateId(_id)
    const user = await UserModel.findById(_id)
    if (password) {
        user.password = password
        const updatePassword = await user.save()
        res.json(updatePassword)
    }
    res.json(user)
})

//Following
exports.followingUser = asyncHandler(async (req, res) => {
    //1.find the user you want to follow
    const { followId } = req.body;
    const loginUserId = req.user.id;
    //find targete user and check if the login user id exist or not
    const targetUser = await UserModel.findById(followId)

    const alreadyFollowing = targetUser?.followers?.find(
        user => user?.toString() === loginUserId.toString()
    )

    if (alreadyFollowing) throw new Error('You have already following this user')
    // console.log(alreadyFollowing)
    await UserModel.findByIdAndUpdate(followId, {
        $push: { followers: loginUserId },
        isFollowing: true
    }, {
        new: true
    })

    //2. Update login user following array
    await UserModel.findByIdAndUpdate(loginUserId, {
        $push: { following: followId }
    }, {
        new: true
    })

    res.json("You have successfully followed this user")
})



exports.unfollowUser = asyncHandler(async (req, res) => {
    const { unFollowId } = req.body
    const loginUserId = req.user.id

    await UserModel.findByIdAndUpdate(unFollowId, {
        $pull: { followers: loginUserId },
        isFollowing: false
    }, {
        new: true
    })


    await UserModel.findByIdAndUpdate(loginUserId, {
        $pull: { following: unFollowId }
    }, { new: true })
    res.json("You have successfully unfollowed this user")

})


exports.blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // console.log(id)
    ValidateId(id)

    const user = await UserModel.findByIdAndUpdate(id, {
        isBlocked: true,
    }, {
        new: true
    })
    res.json(user)
})

exports.unBlockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    ValidateId(id)
    const user = await UserModel.findByIdAndUpdate(id, {
        isBlocked: false,
    }, {
        new: true
    })
    res.json(user)
})

//Account Verification
// exports.generateVarificationToken = asyncHandler(async(req,res)=>{
//     try {
//         const msg={
//             to:'abc@gmail.com',
//             from:'blog@gmail.com',
//             subject:'Hello from Blog App',
//             text: 'Hello from Blog App- Good Morning'
//         }
//         await sgMail.send(msg)
//         res.json("Email Sent")
//     } catch (error) {
//         res.json(error)
//     }
// })

exports.generateVerificationTokenCtrl = asyncHandler(async (req, res) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });

        let msg = {
            from: "User email", // Sender email
            to: "example@gmail.com", // Receiver email
            subject: "Verification", // Title email
            text: "This is a verification message", // Text in email
            html: "<b>This is a verification message</b>", // Html in email
        }

        await transporter.sendMail(msg);

        res.json("Email sent");
    } catch (error) {
        res.json(error);
    }
});


//Profile Photo
exports.profilePhtoUpload = asyncHandler(async (req, res) => {
    //Find login User
    const { _id } = req.user;
    // blockUser(req?.user)
    //1. Get oath to img
    const localPath = `public/images/profile/${req.file.filename}`
    //2. Upload to cloudinary
    const imageUploaded = await cloudinaryUploadImage(localPath)
    const foundUser = await UserModel.findByIdAndUpdate(_id, {
        profilePhoto: imageUploaded?.url
    }, { new: true })
    // console.log(imageUploaded)
    fs.unlinkSync(localPath)
    res.json(foundUser)
})