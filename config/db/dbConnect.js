const mongoose = require('mongoose');



const dbConnect =async()=>{
    try {
        // console.log(process.env.DB_URL)
        await mongoose.connect(process.env.DB_URL,{
            // useCreateIndex: true,
            // useFindAndModify: true,
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        console.log("DB Connected Successfully");

    } catch (error) {
        console.log(`Error ${error.message}`)        
    }
}


module.exports = dbConnect