const Video = require('../model/Video')
const Comment = require('../model/Comment')
const User = require('../model/User')
const jwt = require('jsonwebtoken')

const uploadComment = async (req, res) => {
    try {
        const videoId = req.params.videoId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(400).json({
                msg: 'Video Not Found'
            })
        }

        const comment = new Comment({
            commentText: req.body.comment,
            videoId: videoId,
            commentBy: userId
        })

        await comment.save()

        res.status(200).json({
            comment: comment
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}


const commentsByVideoId = async (req, res) => {
    try {
        const videoId = req.params.videoId

        const comments = await Comment.find({ videoId: videoId }).populate('commentBy', '_id channelName profilePicUrl')
        if (comments.length == 0) {
            return res.status(200).json({
                comments: []
            })
        }

        res.status(200).json({
            comments: comments
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}


const commentBycommentId = async (req, res) => {
    try {
        const commentId = req.params.commentId
        const comment = await Comment.findById(commentId).populate('commentBy', '_id channelName profilePicUrl')
        if (!comment) {
            return res.status(400).json({
                msg: 'Comment Not Found'
            })
        }

        res.status(200).json({
            comment: comment
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}


const editComment = async (req, res) => {
    try {
        const commentId = req.params.commentId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(400).json({
                msg: 'Comment Not found'
            })
        }

        if (userId != comment.commentBy.toString()) {
            return res.status(401).json({
                msg: 'Not Authorized'
            })
        }

        comment.commentText = req.body.commentText
        comment.isEdited = true
        await comment.save()

        res.status(200).json({
            msg: 'Comment edited success',
            comment: comment
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const likeUnlike = async (req, res) => {
    try {
        const commentId = req.params.commentId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(401).json({
                msg: 'Comment Not Found'
            })
        }

        if (comment.likedBy.includes(userId)) {
            comment.likedBy.pull(userId)
            await comment.save()
            return res.status(200).json({
                msg: 'Like Removed',
                likeStatus : false,
                dislikeStatus : comment.dislikedBy.includes(userId)
            })
        }

        comment.likedBy.push(userId)
        await comment.save()
        return res.status(200).json({
            msg: 'Like Success',
            likeStatus : true,
            dislikeStatus : comment.dislikedBy.includes(userId)
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const dislikeUndislike = async (req, res) => {
    try {
        const commentId = req.params.commentId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(401).json({
                msg: 'Comment Not Found'
            })
        }

        if (comment.dislikedBy.includes(userId)) {
            comment.dislikedBy.pull(userId)
            await comment.save()
            return res.status(200).json({
                msg: 'dislike Removed',
                dislikeStatus : false,
                likeStatus : comment.likedBy.includes(userId)
            })
        }

        comment.dislikedBy.push(userId)
        await comment.save()
        return res.status(200).json({
            msg: 'dislike Success',
            dislikeStatus : true,
            likeStatus : comment.likedBy.includes(userId)
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}


const deleteById = async (req, res) => {
    try {
        const commentId = req.params.commentId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const comment = await Comment.findById(commentId).populate('videoId', 'uploadedBy')
        // console.log(comment)
        // console.log(comment.videoId.uploadedBy)
        if (!comment) {
            return res.status(401).json({
                msg: 'Comment Not Found'
            })
        }

        console.log(userId)
        console.log(comment.videoId.uploadedBy)
        console.log(comment.commentBy)


        if (comment.commentBy.toString() != userId || comment.videoId.uploadedBy.toString() != userId) {
            return res.status(404).json({
                msg: 'Not Authorized'
            })
        }

        await Comment.findByIdAndDelete(commentId)
        res.status(200).json({
            msg: 'Comment Deleted'
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const commentLikeStatus = async (req, res) => {
    try {
        const videoId = req.params.videoId
        var comments = await Comment.find({ videoId: videoId }).select('-likedBy -dislikedBy').populate('commentBy', '_id channelName profilePicUrl')
        // console.log(comments)
        var newUpdatedComments = []
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            const tokenData = jwt.verify(token, process.env.SEC_KEY)
            const userId = tokenData._id

            // console.log( ' ye function call hua hai')

            const newComments = await Comment.find({ videoId: videoId }).populate('commentBy', '_id channelName profilePicUrl')
            // console.log(comments)
            // console.log(newComments.likedBy)


            newUpdatedComments = newComments.map(comment => (
                {
                    ...comment._doc,
                    isLike: comment.likedBy.some(c => c.toString() === userId.toString()),
                    isDislike: comment.dislikedBy.some(c => c.toString() === userId.toString())
                }
            ))

            newUpdatedComments = newUpdatedComments.map(comment => {
                const { likedBy, dislikedBy, ...rest } = comment
                return rest
            })

            // console.log(newUpdatedComments)

        }
        else {

            // console.log('without auth called')
            newUpdatedComments = await comments.map(comment => (
                {
                    ...comment._doc,
                    isLike: false,
                    isDislike: false
                }
            ))
            // console.log(newUpdatedComments)
        }

        return res.status(200).json({
            comments: newUpdatedComments
        })
    }
    catch (err) {
        console.log(err)
    }
}


module.exports = { uploadComment, commentsByVideoId, commentBycommentId, editComment, likeUnlike ,dislikeUndislike, deleteById, commentLikeStatus }