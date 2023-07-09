const asyncHandler = require('express-async-handler');
const PostModel = require("../model/post/PostModel");
const UserModel = require('../model/user/UserModel');
const ValidateId = require('../utils/ValidateMongoDbId.js');
const Filter = require('bad-words');
const cloudinaryUploadImage = require('../utils/cloudinary');
const fs = require('fs');
const { loginUser, blockUser } = require('./UserController');


exports.createPost = asyncHandler(async (req, res) => {
    const { _id } = req.user
    // ValidateId(req.body.user)
    // console.log(req?.user)
    // blockUser(req?.user)
    const filter = new Filter()
    const isProfane = filter.isProfane(req.body.title, req.body.description)
    // console.log(isProfane)
    if (isProfane) {

        await UserModel.findByIdAndUpdate(_id, {
            isBlocked: true
        }, {
            new: true
        })
        throw new Error('Creating failed because it contain profane words and you have been blocked')
    }
    const localPath = `public/images/posts/${req.file.filename}`
    const imgUploaded = await cloudinaryUploadImage(localPath)
    // res.json(imgUploaded.url)

    try {
        const post = await PostModel.create({
            ...req.body,
            image: imgUploaded?.url,
            user: _id
        })
          await UserModel.findByIdAndUpdate(
            _id,
            {
              $inc: { postCount: 1 },
            },
            {
              new: true,
            }
          );
        fs.unlinkSync(localPath)
        res.json(post)
        //Remove uploaded image
    } catch (error) {
        res.json(error)
    }

})


//Fetch all Posts
exports.getAllPosts = asyncHandler(async (req, res) => {
    const hascat = req.query.category
    try {
        if (hascat) {
            const posts = await PostModel.find({ category: hascat }).populate("user").populate('comments').sort("-createdAt")
            res.json(posts)
        }
        else {

            const posts = await PostModel.find({}).populate("user").populate('comments').sort("-createdAt")
            res.json(posts)
        }
        // const postCount = await PostModel.count()

    }
    catch (error) {
        res.json(error)
    }
})


//fetch single post
exports.getSinglePost = asyncHandler(async (req, res) => {
    const { id } = req.params
    ValidateId(id)
    try {
        const post = await PostModel.findById(id).populate('user').populate('disLikes').populate('likes').populate('comments');

        await PostModel.findByIdAndUpdate(id, {
            $inc: { numViews: 1 }
        }, { new: true })
        //update number of views
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

//Update Post
exports.updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params
    ValidateId(id)
    try {
        const post = await PostModel.findByIdAndUpdate(id, {
            ...req.body,
            user: req.user?._id
        }, { new: true })
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

//Delete Post
exports.deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params
    ValidateId(id)
    try {
        const post = await PostModel.findByIdAndDelete(id)
        // res.json(post)
        res.json({ success: true, post })
    } catch (error) {
        res.json(error)
    }
})


//Likes
exports.toggleAndLikeToPost = asyncHandler(async (req, res) => {
    //find post to like
    const { postId } = req.body
    // ValidateId(id)
    try {

        const post = await PostModel.findById(postId)
        //2. find login user
        const loginUserId = req?.user?._id
        //3 check this user liked or not
        const isLiked = post?.isLiked

        //4 check user dislike or not
        const alreadyDisLiked = post?.disLikes?.find(userId => userId.toString() === loginUserId?.toString())
        // console.log(alreadyDisLiked)
        //5.remove the user from dislike array
        if (alreadyDisLiked) {
            const post = await PostModel.findByIdAndUpdate(postId, {
                $pull: { disLikes: loginUserId },
                isDisLiked: false
            }, { new: true })

            res.json(post)
        }
        //Toggle
        //if user already liked then dislike
        if (isLiked) {
            const post = await PostModel.findByIdAndUpdate(postId, {
                $pull: { likes: loginUserId },
                isLiked: false
            }, { new: true })

            res.json(post)
        }
        //add to like
        else {
            const post = await PostModel.findByIdAndUpdate(postId, {
                $push: { likes: loginUserId },
                isLiked: true
            }, { new: true })
            res.json(post)
        }
    } catch (error) {
        res.json(error)
    }
})

exports.toggleAndDislikesToPost = asyncHandler(async (req, res) => {
    // res.json("DislikesToPost")
    const { postId } = req.body
    try {
        const post = await PostModel.findById(postId)

        const loginUserId = req?.user?._id
        const isDisLiked = post?.isDisLiked
        const alreadyLiked = post?.likes?.find(userId => userId.toString() === loginUserId?.toString())
        // console.log(alreadyLiked)

        //5. remove the user from lik
        if (alreadyLiked) {
            const post = await PostModel.findByIdAndUpdate(postId, {
                $pull: { likes: loginUserId },
                isLiked: false
            }, { new: true })

            res.json(post)
        }

        //Toggle 
        //if user already disliked then likes
        // console.log(isDisLiked)
        if (isDisLiked) {
            const post = await PostModel.findByIdAndUpdate(postId, {
                $pull: { disLikes: loginUserId },
                isDisLiked: false
            }, { new: true })
            res.json(post)
        }
        else {
            const post = await PostModel.findByIdAndUpdate(postId, {
                $push: { disLikes: loginUserId },
                isDisLiked: true
            }, { new: true })
            res.json(post)
        }
    } catch (error) {
        res.json(error)
    }

})