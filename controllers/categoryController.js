const AuthMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('express-async-handler');
const CategoryModel = require('../model/category/CategoryModel');
const ValidateId = require('../utils/ValidateMongoDbId');



exports.createCategory = asyncHandler(async(req,res)=>{
    
    try {
        
        const category = await CategoryModel.create({
            user: req.user._id,
            title: req.body.title
            

        })
        res.json(category)
    } catch (error) {
     res.json(error)   
    }
})

exports.getAllCategory = asyncHandler(async(req,res)=>{
    
    try {

        const categories = await CategoryModel.find({})
          .populate("user")
          .sort("-createdAt");
        res.json(categories);
      } catch (error) {
        res.json(error);
      }
})

exports.getSingleCategory = asyncHandler(async(req,res)=>{
    const {id} = req.params
    ValidateId(id)
    try {
        const category = await CategoryModel.findById(id).populate("user")
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})


exports.updateCategory = asyncHandler(async(req,res)=>{
    
    const {id}= req.params
    try {
        const category = await CategoryModel.findByIdAndUpdate(id,{
            title: req?.body?.title,

        },{new:true,runValidators:true})
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})

exports.deleteCategory = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const category = await CategoryModel.findByIdAndDelete(id)
        res.json({success:true,category})
    } catch (error) {
        res.json(error)
    }
})
