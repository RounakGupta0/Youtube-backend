const User = require('../model/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cloudinary = require('../configure/cloudinary')

const signup = async (req, res) => {
    try {
        const isEmailExist = await User.find({ email: req.body.email })
        if (isEmailExist.length > 0) {
            return res.status(400).json({
                msg: 'email already registered'
            })
        }
        const isChannelExist = await User.find({ channelName: req.body.channelName })
        if (isChannelExist.length > 0) {
            return res.status(400).json({
                msg: 'channel name already exist try different one'
            })
        }
        const hash = await bcrypt.hash(req.body.password, 10)
        const newUser = new User({
            channelName: req.body.channelName,
            email: req.body.email,
            password: hash,
            description: req.body.description
        })
        const result = await newUser.save()

        res.status(200).json({
            msg: 'Account created',
            newUser: {
                _id: result._id,
                channelName: result.channelName
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error : err.message
        })
    }
}

const login = async (req, res) => {
    try {
        const checkEmail = await User.findOne({ email: req.body.email })
        if (!checkEmail) {
            return res.status(400).json({
                msg: 'email not registered do signup first'
            })
        }

        const verifyPass = await bcrypt.compare(req.body.password, checkEmail.password)
        if (!verifyPass) {
            return res.status(401).json({
                msg: "email and password doesn't match"
            })
        }

        const token = jwt.sign(
            {
                _id: checkEmail._id,
                email: checkEmail.email,
                channelName: checkEmail.channelName
            },
            process.env.SEC_KEY,
            {
                expiresIn: '30d'
            })

        res.status(200).json({
            channelName: checkEmail.channelName,
            channelId : checkEmail._id,
            token: token
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const subscribe = async (req, res) => {
    try {
        const channelId = req.params.channelId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        console.log(tokenData)

        if (channelId == tokenData._id) {
            return res.status(401).json({
                msg: 'You cant subscribe yourself'
            })
        }

        const channel = await User.findById(channelId)
        if (!channel) {
            return res.status(404).json({
                msg: 'channel not found'
            })
        }

        if (channel.subscribers.includes(tokenData._id)) {
            return res.status(401).json({
                msg: 'you already subscribed'
            })
        }

        channel.subscribers.push(tokenData._id)
        channel.subscriberCount += 1
        await channel.save()

        console.log(channelId)
        console.log(channel._id)

        console.log(tokenData._id)
        const user = await User.findById(tokenData._id)
        console.log(user)
        user.subscribedTo.push(channelId)
        await user.save()

        res.status(200).json({
            msg: 'Subscribed',
            subscriberCount: channel.subscriberCount
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const unsubscribe = async (req, res) => {
    try {
        const channelId = req.params.channelId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const channel = await User.findById(channelId)
        if (!channel) {
            res.status(400).json({
                msg: 'channel not found'
            })
        }

        if (!channel.subscribers.includes(tokenData._id)) {
            return res.status(400).json({
                msg: 'You havent subscribed '
            })
        }

        const subscribers = channel.subscribers.filter(userId => userId != tokenData._id)
        channel.subscribers = subscribers

        channel.subscriberCount -= 1
        await channel.save()

        const user = await User.findById(tokenData._id)
        const subscribedTo = user.subscribedTo.filter(channelID => channelID != channelId)
        user.subscribedTo = subscribedTo
        await user.save()

        res.status(200).json({
            msg: 'Unsubscribed',
            subscriberCount: channel.subscriberCount
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const uploadProfilePic = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        console.log('file upload call hua')
        const user = await User.findById(tokenData._id)
        if (!user) {
            return res.status(401).json({
                msg: 'user not found'
            })
        }

        if (!req.files || !req.files.profilePic) {
            return res.status(400).json({
                msg: 'File Not Found'
            })
        }
        console.log('file mil gya')
        if (user.profilePicUrl) {
            await cloudinary.uploader.destroy(user.profilePicId)
            console.log('file delete krdiya')
        }

        const result = await cloudinary.uploader.upload(req.files.profilePic.tempFilePath)

        user.profilePicUrl = result.secure_url
        user.profilePicId = result.public_id

        console.log('file upload ho gya')
        await user.save()
        res.status(200).json({
            msg: 'profile Pic uploaded'
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const uploadProfileCoverPic = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        // console.log('file upload call hua')
        const user = await User.findById(tokenData._id)
        if (!user) {
            return res.status(401).json({
                msg: 'user not found'
            })
        }

        if (!req.files || !req.files.coverPic) {
            return res.status(400).json({
                msg: 'File Not Found'
            })
        }
        // console.log('file mil gya')
        if (user.coverPicUrl) {
            await cloudinary.uploader.destroy(user.coverPicId)
            // console.log('file delete krdiya')
        }

        const result = await cloudinary.uploader.upload(req.files.coverPic.tempFilePath)

        user.coverPicUrl = result.secure_url
        user.coverPicId = result.public_id

        // console.log('file upload ho gya')
        await user.save()
        res.status(200).json({
            msg: 'profile CoverPic uploaded'
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

const watchLater = async(req,res) => {
    try
    {
        const videoId = req.params.videoId
        const token = req.headers.authorization.split(' ')[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const video = await Video.findById(videoId)
        if (!video)
        {
            res.status(400).json({
                msg : 'Video Not Found'
            })
        }

        const channel = await User.findById(tokenData._id)
        channel.watchLater.push(videoId)

        await channel.save()

        res.status(200).json({
            msg : 'Video Added to Watch Later'
        })

    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
}


module.exports = { signup, login, subscribe, unsubscribe, uploadProfilePic, uploadProfileCoverPic, watchLater}