const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    msg: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    user: {    // Add a user field to link the chat with a specific user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model("Chat", chatSchema);
