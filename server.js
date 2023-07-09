const express = require('express')
const cors = require('cors')
const dbConnect=require('./config/db/dbConnect')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const app = express()
const userRoute = require('./routes/userRoute')
const { errorHandler, notFound } = require('./middlewares/errorHandler')
const postRoute = require('./routes/postRoute')
const CommentRoute = require('./routes/commentRoute')
const categoryRoute = require('./routes/categoryRoute')
app.use(bodyParser.urlencoded({ extended: true}))

dotenv.config()
//assign function to variable
app.use(express.json())
app.use(cors())
// console.log(app)



const PORT = process.env.PORT || 5000
dbConnect().then(()=>{

    
    app.listen(PORT,console.log(`Server listening on ${PORT}`))
})



//Users Route
app.use('/api/users',userRoute)
app.use('/api/posts',postRoute)
app.use('/api/comments',CommentRoute)
app.use('/api/category',categoryRoute)



//error Handler
app.use(notFound)
app.use(errorHandler)


//custom middleware
// const logger =(req,res,next)=>{
//     console.log("I am Logger")
//     next(); //next passes to  request next middleware

// }
// app.use(logger)
