const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },

    commentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    commentText: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],

    isEdited: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);