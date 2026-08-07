const express = require('express')
const Router = express.Router()
const {signup,login, subscribe,unsubscribe,uploadProfilePic,uploadProfileCoverPic,watchLater}  = require('../controllers/userController')

Router.post('/signup',signup)
Router.post('/login',login)
Router.put('/subscribe/:channelId',subscribe)
Router.put('/unsubscribe/:channelId',unsubscribe)
Router.put('/uploadProfilePic',uploadProfilePic)
Router.put('/uploadCoverPic',uploadProfileCoverPic)
Router.put('/watchLater/:videoId',watchLater)

module.exports = Router