const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Post',
        required:[true,'Post id required']
    },
    user:{
        type:Object,
        // ref:'User',
        required:[true,'User id required']
    },
    description:{
        type:String,
        required:[true,'Comment description required']
    }


},{
    timestamps:true
})


module.exports = mongoose.model('Comment',commentSchema)