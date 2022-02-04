const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 12,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
    highestScore: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
});

module.exports = mongoose.model("User", userSchema);
