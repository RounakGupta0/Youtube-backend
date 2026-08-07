const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    channelName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    profilePicUrl: {
        type: String,
        default: ""
    },

    profilePicId: {
        type: String,
        default: ""
    },

    subscribedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    subscriberCount: {
        type: Number,
        default: 0
    },

    coverPicUrl: {
        type: String,
        default: ""
    },

    coverPicId: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        required: true
    },

    watchLater: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ]

}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)