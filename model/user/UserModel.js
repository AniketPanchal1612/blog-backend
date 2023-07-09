const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: [true, "First Name is required"],
        maxLength:[30,'Your first name is too long']
    },
    lastName:{
        type: String,
        required: [true, "Last Name is required"],
        maxLength:[30,'Your last name is too long']
    },
    profilePhoto:{
        type: String,
        default:'https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png'

    },
    email:{
        type: String,
        required: [true, "Email is required"],
        // unique: [true, "Email is already exists"],
        validate:[validator.isEmail,'Email must be a valid email address']
    },
    bio:{
        type: String,
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        // select: false
    },
    postCount:{
        type: Number,
        default: 0,
    },
    isBlocked:{
        type: Boolean,
        default: false,
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    role:{
        type: String,
        enum:['Admin','Guest','Blogger']
    },
    isFollowing:{
        type: Boolean,
        default: false,
    },
    isUnfollowing:{
        type: Boolean,
        default: false,
    },
    isAccountVerified:{
        type: Boolean,
        default: false,
    },
    accountVerificationToken:String,
    accountVerificationTokenExpires:{
        type:Date,
    },
    //Many to One
    viewedBy:{
        type:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:'User'
            }
        ],
    },
    followers:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        }]
    },
    following:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        }]
    },
    passwordChangeAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,

    active:{
        type:Boolean,
        default:false
    }

},{
    toJSON:{
        virtuals:true
    },
    toJSON:{
        virtuals:true  
    },
    timestamps:true
})


//Virtual method to create a post
userSchema.virtual('posts',{
    ref:'Post',
    foreignField:'user',
    localField:'_id'
})


//
userSchema.virtual('accountType').get(function(){
    const totalFollowers = this.followers?.length
    return (totalFollowers >=1) ? "Pro Account" :"Starter Account"
})

//Hash Password
userSchema.pre('save',async function(next){
    // console.log(this)
    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password =await bcrypt.hash(this.password,salt)
    next()
})

//Compare Password
userSchema.methods.isPasswordMatch= async function(enteredPassword){

    return await bcrypt.compare(enteredPassword,this.password)
}

// const User  = mongoose.model('User',userSchema);
// module.exports = User;
module.exports = mongoose.model('User',userSchema)