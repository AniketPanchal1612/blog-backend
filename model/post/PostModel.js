const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
        trim: true
    },
    category:{
        type:String,
        required:[true,"Post category is required"],
        default:'All'
    },
    isLiked:{
        type:Boolean,
        default:false
    },
    isDisLiked:{
        type:Boolean,
        default:false
    },
    numViews:{
        type:Number,
        default:0
    },
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    disLikes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, "Author is required"]
    },
    description:{
        type:String,
        required:[true, "Description is required"]
    },
    image:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2015/10/02/15/00/diary-968592_1280.jpg"
    }


},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    },
    timestamps:true
})


//populate comment
postSchema.virtual("comments",{
    ref:"Comment",
    foreignField:'post',
    localField:'_id'
})

module.exports = mongoose.model("Post",postSchema)