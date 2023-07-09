const asyncHandler = require('express-async-handler');
const CommentModel = require('./../model/comment/CommentModel')
const AuthMiddleware = require('../middlewares/authMiddleware');
const { watch } = require('../model/user/UserModel');
const ValidateId = require('../utils/ValidateMongoDbId');
const blockUser = require('../utils/blockUser');



exports.createComment = asyncHandler(async (req, res) => {

    const user = req.user;
    // blockUser(user);
    const { postId, description } = req.body
    try {
        const comment = await CommentModel.create({
            post: postId,
            user: user,
            description

        })
        res.json(comment)
    } catch (error) {
        res.json(error)
    }
})

exports.getAllComments = asyncHandler(async (req, res) => {
    try {
        const comments = await CommentModel.find({}).sort("-created")
        const commentCount = await CommentModel.count()
        res.json({ commentCount, comments })
    } catch (error) {
        res.json(error)
    }
})


exports.getSingleComment = asyncHandler(async (req, res) => {
    const { id } = req.params
    ValidateId(id)

    try {
        const comment = await CommentModel.findById(id);
        res.json(comment)
    } catch (error) {
        res.json(error)
    }
})



exports.updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params
    ValidateId(id)
    try {
        const comment = await CommentModel.findByIdAndUpdate(id, {

            post: req.body?.post,
            user: req?.user,
            description: req?.body?.description
        }, { new: true, runValidators:true })
        res.json(comment)
    } catch (error) {
    }
})


exports.deleteComment = asyncHandler(async(req,res)=>{
    const {id} = req.params
    ValidateId(id)
    try {
        const comment = await CommentModel.findByIdAndDelete(id)
        res.json(comment)
    } catch (error) {
        res.json(error)
    }
})