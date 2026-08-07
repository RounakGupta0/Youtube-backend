const express = require('express')
const Router = express.Router()
const {uploadVideo,uploadThumbnail,like,dislike,videoById,allVideos,byChannelId,editVideo,deleteById,trendingVideo} = require('../controllers/videoController')

Router.post('/uploadVideo',uploadVideo)
Router.patch('/uploadThumbnail/:videoId',uploadThumbnail)
Router.put('/like/:videoId',like)
Router.put('/dislike/:videoId',dislike)
Router.get('/byvideoId/:videoId',videoById)
Router.get('/allVideo',allVideos)
Router.get('/byChannelId/:channelId',byChannelId)
Router.put('/updateVideo/:videoId',editVideo)
Router.delete('/deleteById/:videoId',deleteById)
Router.get('/trendingVideo',trendingVideo)

module.exports = Router
