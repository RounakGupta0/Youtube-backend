const Video = require('../model/Video')
const jwt = require('jsonwebtoken')
const cloudinary = require('../configure/cloudinary')

const uploadVideo = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        if (!req.files || !req.files.video) {
            return res.status(404).json({
                msg: 'File Not Found'
            })
        }

        if (!req.files || !req.files.thumbnail) {
            return res.status(401).json({
                msg: 'Kindly upload a thumbnail to proceed'
            })
        }

        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
            resource_type: 'video',
            folder: 'youtube/video'
        })

        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
            resource_type: 'image',
            folder: 'youtube/thumbnail'
        })

        const video = new Video({
            title: req.body.title,
            description: req.body.description,
            videoUrl: uploadedVideo.secure_url,
            videoPublicId: uploadedVideo.public_id,
            thumbnailUrl: uploadedThumbnail.secure_url,
            thumbnailPublicId: uploadedThumbnail.public_id,
            uploadedBy: tokenData._id,
            tags: JSON.parse(req.body.tags),
            category: req.body.category
        })

        const newvideo = await video.save()

        res.status(200).json({
            video: newvideo
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const uploadThumbnail = async (req, res) => {
    try {
        const videoId = req.params.videoId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        if (!req.files || !req.files.thumbnail) {
            return res.status(401).json({
                msg: 'Kindly upload a thumbnail to proceed'
            })
        }

        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(401).json({
                msg: 'Video Not Found'
            })
        }
        // console.log(video)
        // console.log(video.uploadedBy)
        // console.log(tokenData._id)

        if (video.uploadedBy.toString() != tokenData._id) {
            return res.status(400).json({
                msg: 'Not Authorized'
            })
        }

        if (video.thumbnailUrl) {
            await cloudinary.uploader.destroy(video.thumbnailPublicId)
        }

        const newThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
            resource_type: 'image',
            folder: 'youtube/thumbnail'
        })

        video.thumbnailUrl = newThumbnail.secure_url
        video.thumbnailPublicId = newThumbnail.public_id

        await video.save()

        res.status(200).json({
            thumbnail: video.thumbnailUrl
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const like = async (req, res) => {
    try {
        const videoId = req.params.videoId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(400).json({
                msg: 'Video Not Found'
            })
        }

        if (video.likeUsers.includes(tokenData._id)) {
            video.likeUsers.pull(tokenData._id)
            video.likeCount -= 1
            await video.save()

            return res.status(200).json({
                msg: 'Like Removed',
                likeCount: video.likeCount
            })
        }

        if (video.dislikeUsers.includes(tokenData._id)) {
            video.dislikeUsers.pull(tokenData._id)
            video.dislikeCount -= 1
        }

        video.likeUsers.push(tokenData._id)
        video.likeCount += 1
        const savedVideo = await video.save()
        res.status(200).json({
            msg: 'Video Liked',
            likeCount: savedVideo.likeCount,
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const dislike = async (req, res) => {
    try {
        const videoId = req.params.videoId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(401).json({
                error: 'Video Not Found'
            })
        }

        if (video.dislikeUsers.includes(userId)) {
            video.dislikeUsers.pull(userId)
            video.dislikeCount -= 1
            await video.save()

            return res.status(200).json({
                msg: 'dislike Removed',
                dislikeCount: video.dislikeCount
            })
        }

        if (video.likeUsers.includes(userId)) {
            video.likeUsers.pull(userId)
            video.likeCount -= 1
        }

        video.dislikeUsers.push(userId)
        video.dislikeCount += 1
        const savedVideo = await video.save()

        res.status(200).json({
            msg: 'Video Disliked',
            dislikeCount: savedVideo.dislikeCount
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const videoById = async (req, res) => {
    try {
        const videoId = req.params.videoId
        const video = await Video.findById(videoId).populate('uploadedBy', 'profilePicUrl _id channelName subscriberCount')
        if (!video) {
            return res.status(401).json({
                msg: 'Video Not Found'
            })
        }
        video.views += 1
        await video.save()

        return res.status(200).json({
            video: video
        })
    }
    catch (err) {
        console.log()
    }
}

const allVideos = async (req, res) => {
    try {
        const videos = await Video.find()

        if (videos.length == 0) {
            return res.status(401).json({
                msg: 'No videos Found'
            })
        }
        res.status(200).json({
            videos: videos
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const byChannelId = async (req, res) => {
    try {
        const channelId = req.params.channelId

        const videos = await Video.find({ uploadedBy: channelId }).select('_id title thumbnailUrl views').populate('uploadedBy', '_id profilePicUrl channelName subscriberCount')
        if (videos.length == 0) {
            return res.status(401).json({
                msg: 'No video Uploaded Till now on this channel'
            })
        }

        res.status(200).json({
            videos: videos
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const editVideo = async (req, res) => {
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

        if (video.uploadedBy.toString() != userId) {
            return res.status(401).json({
                msg: 'Not Authorized'
            })
        }

        const newVideo = {
            videoUrl: video.videoUrl,
            videoPublicId: video.videoPublicId,
            title: req.body.title,
            description: req.body.description,
            thumbnailUrl: video.thumbnailUrl,
            thumbnailPublicId: video.thumbnailPublicId,
            tags: JSON.parse(req.body.tags),
            category: req.body.category,
            views: video.views,
            likeUsers: video.likeUsers,
            likeCount: video.likeCount,
            dislikeUsers: video.dislikeUsers,
            dislikeCount: video.dislikeCount,
            uploadedBy: video.uploadedBy
        }

        const newVideoRes = await Video.findByIdAndUpdate(videoId, newVideo, { new: true })
        console.log(newVideoRes)
        res.status(200).json({
            newVideo: newVideoRes
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

        if (video.uploadedBy.toString() != userId) {
            return res.status(401).json({
                msg: 'Not Authorized'
            })
        }

        await cloudinary.uploader.destroy(video.videoPublicId, {
            resource_type: "video"
        })
        await cloudinary.uploader.destroy(video.thumbnailPublicId)
        await Video.findByIdAndDelete(videoId)

        return res.status(200).json({
            msg: 'Video Delete Success'
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const trendingVideo = async (req, res) => {
    try {
        const video = await Video.find().populate('uploadedBy', 'profilePicUrl channelName')
            .select('title thumbnailUrl views')
            .sort({ views: -1 })
            .limit(10)

        console.log(video)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}



module.exports = { uploadVideo, uploadThumbnail, like, dislike, videoById, allVideos, byChannelId, editVideo, deleteById, trendingVideo }