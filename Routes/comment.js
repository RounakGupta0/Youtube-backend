const express = require('express')
const Router = express.Router()
const {uploadComment,commentsByVideoId,commentBycommentId,editComment,likeUnlike,deleteById} = require('../controllers/commentController')

Router.post('/uploadComment/:videoId',uploadComment)
Router.get('/commentsByVideoId/:videoId',commentsByVideoId)
Router.get('/commentBycommentId/:commentId',commentBycommentId)
Router.put('/editComment/:commentId',editComment)
Router.put('/like/:commentId', likeUnlike)
Router.delete('/byId/:commentId',deleteById)

module.exports = Router