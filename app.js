require('dotenv').config();
const cors = require('cors')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const userRoute = require('./Routes/user')
const videoRoute = require('./Routes/video')
const commentRoute = require('./Routes/comment')
const fileupload = require('express-fileupload')
const connectDB = require('./configure/mongoDB')

app.use(cors())

connectDB()

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

app.use('/user', userRoute)
app.use('/video',videoRoute)
app.use('/comment',commentRoute)

module.exports = app