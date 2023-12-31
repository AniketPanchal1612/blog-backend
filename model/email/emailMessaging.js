const mongoose = require('mongoose');


const emailMsgSchema = new mongoose.Schema({
    fromEmail:{
        type:String,
        required:true
    },
    toEmail:{
        type:String,
        required:true
    },
    messsage:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    sentBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    isFlagged:{
        type:Boolean,
        default:false
    }


},{
    timestamps:true,
})


module.exports = mongoose.model()